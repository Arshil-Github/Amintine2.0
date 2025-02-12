import { verifyToken } from "../utils/token";
import { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "No token provided" }, 401);

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) return c.json({ error: "Invalid token" }, 401);

  c.set("userId", payload.userId);
  await next();
};
