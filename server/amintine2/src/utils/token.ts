import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("MeiPareshaan");

export const createAccessToken = async (userId: string) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
};

export const createRefreshToken = async (userId: string) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (e) {
    return null;
  }
};
