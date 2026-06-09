"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

function orderInput(formData) {
  return {
    customer: String(formData.get("customer") || ""),
    product: String(formData.get("product") || "").trim(),
    quantity: Number(formData.get("quantity") || 0),
    unitPrice: Number(formData.get("unitPrice") || 0),
    status: String(formData.get("status") || "Pendiente"),
    notes: String(formData.get("notes") || "").trim()
  };
}

export async function createOrderAction(formData) {
  await requireUser();
  await connectDB();
  const input = orderInput(formData);
  const customer = await Customer.findById(input.customer);
  if (!customer) redirect("/pedidos?error=cliente");
  await Order.create(input);
  revalidatePath("/pedidos");
  redirect("/pedidos");
}

export async function updateOrderAction(id, formData) {
  await requireUser();
  await connectDB();
  const input = orderInput(formData);
  const customer = await Customer.findById(input.customer);
  if (!customer) redirect(`/pedidos/${id}?error=cliente`);
  await Order.findByIdAndUpdate(id, input, { runValidators: true });
  revalidatePath("/pedidos");
  redirect(`/pedidos/${id}`);
}

export async function deleteOrderAction(id) {
  await requireUser();
  await connectDB();
  await Order.findByIdAndDelete(id);
  revalidatePath("/pedidos");
  redirect("/pedidos");
}
