import { Hono } from "hono";
import { getPrisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const confessionRouter = new Hono();

confessionRouter.post("/create", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const { content, isAnonymous, targetName } = await c.req.json();
  const userId: any = c.get("userId");

  try {
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, maskedName: true },
    });

    const author: string = user.maskedName;

    const confession = await prisma.confession.create({
      data: {
        userId,
        content,
        isAnonymous,
        targetName,
        authorName: author,
      },
      select: {
        id: true,
        userId: true,
        content: true,
        isAnonymous: true,
        targetName: true,
        likes: true,
      },
    });

    return c.json({ message: "Confession created successfully" });
  } catch (e) {
    return c.json({ error: e });
  }
});

confessionRouter.post("/like", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const { confessionId } = await c.req.json();
  const userId: string = c.get("userId") as string;

  try {
    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      select: { likes: true },
    });

    if (!confession) {
      return c.json({ error: "Confession not found" }, 404);
    }

    const userAlreadyLiked = confession.likes.includes(userId);

    const updatedLikes = userAlreadyLiked
      ? confession.likes.filter((id) => {
          id !== userId;
        })
      : [...confession.likes, userId];

    const updatedConfession = await prisma.confession.update({
      where: { id: confessionId },
      data: { likes: updatedLikes },
      select: {
        id: true,
        userId: true,
        content: true,
        isAnonymous: true,
        targetName: true,
        likes: true,
      },
    });

    return c.json({
      status: userAlreadyLiked ? "disliked" : "liked",
    });
  } catch (e) {
    console.log(e);
    return c.json({ error: "Like Failed" });
  }
});

confessionRouter.get("/all", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const userId: string = c.get("userId") as string;

  const confessions: any = await prisma.confession.findMany({
    select: {
      id: true,
      userId: true,
      content: true,
      isAnonymous: true,
      targetName: true,
      authorName: true,
      likes: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const dataToSend = confessions.map((confession: any) => {
    return {
      id: confession.id,
      content: confession.content,
      isAnonymous: confession.isAnonymous,
      targetName: confession.targetName,
      likes: confession.likes,
      author: confession.authorName,
      createdAt: confession.createdAt,
      likedByUser: confession.likes.includes(userId),
    };
  });

  return c.json(dataToSend);
});

confessionRouter.get("/latest", async (c) => {
  const prisma = getPrisma(c.env);

  const latestConfession = await prisma.confession.findFirst({
    select: {
      id: true,
      content: true,
      isAnonymous: true,
      targetName: true,
      likes: true,
      authorName: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latestConfession) return c.json(null);

  return c.json({
    id: latestConfession.id,
    content: latestConfession.content,
    isAnonymous: latestConfession.isAnonymous,
    targetName: latestConfession.targetName,
    likes: latestConfession.likes,
    author: latestConfession.authorName,
    createdAt: latestConfession.createdAt,
  });
});

export default confessionRouter;
