import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const getPrisma = (env: any) => {
  return new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  });
};

// export const prisma = new PrismaClient().$extends(withAccelerate());
