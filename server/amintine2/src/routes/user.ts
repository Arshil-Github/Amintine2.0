import { Hono } from "hono";
import { getPrisma } from "../prisma";
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "../utils/token";
import { verifyGoogleToken } from "../utils/googleauth";
import { locationMiddleware } from "../middleware/location";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/auth";

const userRouter = new Hono();

userRouter.post("/register", locationMiddleware, async (c) => {
  const prisma = getPrisma(c.env);

  let {
    firstName,
    lastName,
    maskedName,
    gender,
    age,
    stype,
    bio,
    interests,
    googleToken,
  } = await c.req.json();

  //Checks
  if (
    !firstName ||
    !maskedName ||
    !gender ||
    !age ||
    !stype ||
    !bio ||
    !interests
  ) {
    return c.json({ error: "Please provide all required fields" });
  }
  if (!lastName) {
    lastName = "";
  }

  if (!googleToken) {
    return c.json({ error: "Google Sign in Failed" });
  }

  try {
    const googleUser = await verifyGoogleToken(googleToken);
    const ageNumber = Number(age);
    if (isNaN(ageNumber)) {
      return c.json({ error: "Age must be a valid number" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      return c.json({ error: "User already exists" }, 401);
    }
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        maskedName,
        gender,
        age: ageNumber,
        stype,
        bio,
        email: googleUser.email,
        interests,
      },
      select: {
        id: true, // Select only necessary fields for faster response
        firstName: true,
        maskedName: true,
      },
    });

    //Create tokens
    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    //Update Refresh Token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { token: refreshToken },
    });

    return c.json({ accessToken, refreshToken });
  } catch (e: any) {
    console.error("Server Error:", e);

    // Prisma-specific error handling
    if (e.code === "P2002") {
      return c.json({ error: "Email already exists" }, 409);
    }

    if (e.message.includes("Invalid Google Token")) {
      return c.json({ error: "Invalid Google Token" }, 401);
    }

    return c.json({ error: "Server Error" }, 500);
  }
});

userRouter.post("/login", locationMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const { googleToken } = await c.req.json();

  if (!googleToken) {
    return c.json({ error: "Google Sign in Failed" });
  }

  try {
    const googleUser = await verifyGoogleToken(googleToken);

    // Upsert User in DB
    const user = await prisma.user.findFirst({
      where: { email: googleUser.email },
      select: { id: true, firstName: true, maskedName: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    // Save Refresh Token in DB
    await prisma.user.update({
      where: { email: googleUser.email },
      data: { token: refreshToken },
    });

    return c.json({ accessToken, refreshToken });
  } catch (e) {
    console.log(e);
    return c.json({ error: "Invalid Google Token" }, 401);
  }
});

userRouter.post("/refresh", async (c) => {
  const prisma = getPrisma(c.env);

  const { refreshToken } = await c.req.json();
  console.log(refreshToken);
  if (!refreshToken) {
    return c.json({ error: "Invalid Refresh Token" }, 401);
  }

  const payload = await verifyToken(refreshToken);
  if (!payload || !payload.userId) {
    return c.json({ error: "Invalid Refresh Token" }, 401);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: String(payload.userId) },
  });
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  const accessToken = await createAccessToken(user.id);

  return c.json({ accessToken });
});

userRouter.get("/info/:id", async (c) => {
  console.log("Hello");
  const prisma = getPrisma(c.env);
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id } });
  return c.json(user);
});

userRouter.post("/uploadProfilePicture", authMiddleware, async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL as string,
    c.env.SUPABASE_KEY as string
  );
  const prisma = getPrisma(c.env);
  const userId: string = c.get("userId") as string;
  const formData = await c.req.formData();
  const file = formData.get("file");

  //Upload the image to supabase
  if (!(file instanceof File)) return c.json({ error: "Invalid file" }, 400);
  const fileName = `profile_${userId}_${Date.now()}.png`;
  const response = await supabase.storage
    .from("profile-pictures")
    .upload(fileName, file, { contentType: "image/png" });

  if (response.error) {
    console.log(response.error);
    return c.json({ error: "Upload failed" }, 500);
  }
  const imageResponse = supabase.storage
    .from("profile-pictures")
    .getPublicUrl(fileName);

  const imageUrl = imageResponse.data.publicUrl;

  //Check if user already has a profile picture
  const existingPhoto = await prisma.userPhotos.findFirst({
    where: { userId },
  });

  //If already has a profile picture, update it
  if (existingPhoto) {
    const updatedPhoto = await prisma.userPhotos.update({
      where: { id: existingPhoto.id },
      data: { profilePhoto: imageUrl },
    });
    return c.json({ success: true, imageResponse });
  }

  //Store this as profile in database as new entry if not
  const userPhoto = await prisma.userPhotos.create({
    data: {
      userId,
      profilePhoto: imageUrl,
    },
  });

  return c.json({ success: true, imageResponse });
});

// userRouter.post("/image", async (c) => {
//   const formData = await c.req.formData();
//   const file = formData.get("file");

//   if (!(file instanceof File)) return c.json({ error: "Invalid file" }, 400);

//   const fileName = `profile_${Date.now()}.png`;

//   try {
//     const r = await supabase.storage
//       .from("profile-pictures")
//       .upload(fileName, file, { contentType: "image/png" });

//     console.log(r);

//     return c.json({ success: true });
//   } catch (e) {
//     console.log(e);
//     return c.json({ error: "Upload failed" }, 500);
//   }
// });

export default userRouter;
