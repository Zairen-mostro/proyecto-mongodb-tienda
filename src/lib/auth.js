import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const cookieName = "tienda_session";
const maxAge = 60 * 60 * 8;

function getSecret() {
  return process.env.AUTH_SECRET || "clave-local-solo-para-desarrollo";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.expiresAt || payload.expiresAt < Date.now()) return null;
  return payload;
}

export async function createSession(userId) {
  const cookieStore = await cookies();
  const token = sign({
    userId: userId.toString(),
    expiresAt: Date.now() + maxAge * 1000
  });

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/"
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const payload = verify(cookieStore.get(cookieName)?.value);
  if (!payload?.userId) return null;

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("_id name email")
    .lean();

  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
