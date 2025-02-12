import { Hono } from "hono";
import { cors } from "hono/cors";

import userRouter from "./routes/user";
import confesstionRouter from "./routes/confession";
import randomMatchRouter from "./routes/randomMatch";
import chatRouter from "./routes/chat";

const app = new Hono();

// Enable CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://amintine2.vercel.app"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type", "Authorization"],
  })
);

app.route("/user", userRouter);
app.route("/confession", confesstionRouter);
app.route("/randomMatch", randomMatchRouter);
app.route("/chat", chatRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
