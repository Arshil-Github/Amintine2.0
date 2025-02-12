import { Hono } from "hono";
import { getPrisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const randomMatchRouter = new Hono();

randomMatchRouter.get("/match", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  // const { userId } = await c.req.json();
  const userId: any = c.get("userId");

  //Check for spins
  const userSpins = await getSpins(userId, prisma);
  if (userSpins.spins === 0) {
    return c.json({ error: "No spins left" });
  }

  const user: any = await prisma.user.findUnique({
    where: { id: userId },
  });

  //Get list of my matches
  const myMatches = await prisma.match.findMany({
    where: {
      OR: [{ userId: userId }, { targetId: userId }],
    },
    select: { userId: true, targetId: true },
  });

  // Ensure you get the matched user (the other person)
  const matchedTargetIds = myMatches.map((match) =>
    match.userId === userId ? match.targetId : match.userId
  );

  let targetGender;
  if (user.gender == "m") targetGender = "f";
  else if (user.gender == "f") targetGender = "m";
  else targetGender = null;

  const totalUsers = await prisma.user.count({
    where: {
      id: { not: userId, notIn: matchedTargetIds },
      ...(targetGender ? { gender: targetGender } : { gender: { not: "" } }),
    },
  });

  if (totalUsers === 0) {
    return c.json({ error: "No users found" });
  }
  const randomIndex = Math.floor(Math.random() * totalUsers);

  const randomUser = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      ...(targetGender ? { gender: targetGender } : { gender: { not: "" } }),
    },
    skip: randomIndex,
  });

  if (!randomUser) {
    return c.json({ error: "No users found" });
  }

  //Update spin
  const newUserSpins = await prisma.userSpins.update({
    where: { id: userSpins.id },
    data: {
      spins: userSpins.spins - 1,
    },
  });

  //Add the match to the database
  const match = await prisma.match.create({
    data: {
      userId: userId,
      targetId: randomUser.id,
    },
  });
  return c.json(randomUser);
});

const getSpins = async (userId: string, prisma: any) => {
  //get the createdAt from userSpin and add spin at each 24 hours
  let userSpins = await prisma.userSpins.findFirst({
    where: { userId: userId },
  });

  //Handle if no spins found
  if (userSpins == null) {
    await prisma.userSpins.create({
      data: {
        userId: userId,
        spins: 3,
      },
    });
    return 3;
  }

  //Calculate the hours passed
  const now = new Date();
  const hoursPassed = Math.floor(
    (now.getTime() - new Date(userSpins.updatedAt).getTime()) / (1000 * 60 * 60)
  );

  //Update the spins
  if (hoursPassed > 0 && userSpins.spins < 3) {
    const newSpins = Math.min(3, userSpins.spins + hoursPassed);

    userSpins = await prisma.userSpins.update({
      where: { id: userSpins.id },
      data: {
        spins: newSpins,
        updatedAt: now,
      },
    });
  }
  return userSpins;
};

randomMatchRouter.get("/spins", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const userId: any = c.get("userId");

  const userSpins = await getSpins(userId, prisma);

  return c.json(userSpins);
});

// Get All Matches of a User
randomMatchRouter.get("/matches/:userId", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = c.req.param("userId");

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userId: userId }, { targetId: userId }],
    },
  });

  return c.json(matches);
});

export default randomMatchRouter;
