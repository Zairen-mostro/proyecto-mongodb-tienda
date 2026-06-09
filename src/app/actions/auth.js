"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import User from "@/models/User";

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  await connectDB();
  const user = await User.findOne({ email });
  const isValid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!isValid) {
    redirect("/login?error=1");
  }

  await createSession(user._id);
  redirect("/dashboard");
}

export async function registerAction(formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (password.length < 8) {
    redirect("/login?registerError=password");
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, passwordHash });
    await createSession(user._id);
  } catch (error) {
    redirect("/login?registerError=email");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
