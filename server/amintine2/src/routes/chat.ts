import { Hono } from "hono";
import { getPrisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const chatRouter = new Hono();

// Create a new chat between two users
chatRouter.post("/create", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const userId: string = c.get("userId") as string;

  const participantId = body.paricipantId;
  console.log(body);

  try {
    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: participantId } } },
        ],
      },
    });

    if (existingChat) {
      return c.json({
        message: "Chat already exists",
        chatId: existingChat.id,
      });
    }

    console.log(participantId);

    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            {
              userId: userId,
              maskedName: "", // Add any default or dynamic value here
            },
            {
              userId: participantId,
              maskedName: "",
            },
          ],
        },
      },
    });

    console.log("dasdmiuahdnsui");

    return c.json({ message: "Chat created successfully", chat });
  } catch (e) {
    console.log(e);
    return c.json({ error: e });
  }
});

// Send a message in an existing chat
chatRouter.post("/send", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const { chatId, content } = await c.req.json();
  const senderId: string = c.get("userId") as string;

  try {
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
      },
    });
    console.log("message");

    return c.json({
      message: "Message sent successfully",
      messageData: message,
    });
  } catch (e) {
    console.log(e);
    return c.json({ error: e });
  }
});

const getUserName = async (prisma: any, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  return `${user.firstName} ${user.lastName}`;
};

// Get all chats for the logged-in user
chatRouter.get("/my-chats", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const userId: string = c.get("userId") as string;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userId, // Make sure userId is not undefined
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Latest message
        },
        participants: true, // Optional: Include participant details
      },
      orderBy: { updatedAt: "desc" },
    });

    const chatsWithUsernames = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p.userId !== userId
        );
        const otherUserName = otherParticipant
          ? await getUserName(prisma, otherParticipant.userId)
          : "Unknown";

        return {
          ...chat,
          otherUserName,
        };
      })
    );

    return c.json(chatsWithUsernames);
  } catch (e) {
    console.log(e);
    return c.json({ error: e });
  }
});

// Get messages in a specific chat
chatRouter.get("/messages/:chatId", authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const chatId = c.req.param("chatId");
  const userId: string = c.get("userId") as string;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    const formattedData = messages.map((message) => {
      return {
        sender: message.senderId == userId ? "me" : "them",
        message: message.content,
        timestamp: message.createdAt,
      };
    });

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });

    if (!chat) {
      return c.json({ error: "Chat not found" });
    }
    const otherParticipant = chat.participants.find((p) => p.userId !== userId);
    const otherUserId: string = otherParticipant ? otherParticipant.userId : "";

    if (!otherUserId) {
      return c.json({ error: "Other user not found" });
    }
    //Get the masked name of the other user
    const otherUserName = await getUserName(prisma, otherUserId);
    console.log(otherUserName);

    return c.json({
      chatId,
      messages: formattedData,
      otherUserName,
    });
  } catch (e) {
    return c.json({ error: e });
  }
});

export default chatRouter;
