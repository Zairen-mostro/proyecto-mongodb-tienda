"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

function customerInput(formData) {
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: String(formData.get("phone") || "").trim(),
    status: String(formData.get("status") || "Activo"),
    notes: String(formData.get("notes") || "").trim()
  };
}

export async function createCustomerAction(formData) {
  await requireUser();
  await connectDB();
  await Customer.create(customerInput(formData));
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCustomerAction(id, formData) {
  await requireUser();
  await connectDB();
  await Customer.findByIdAndUpdate(id, customerInput(formData), {
    runValidators: true
  });
  revalidatePath("/clientes");
  redirect(`/clientes/${id}`);
}

export async function deleteCustomerAction(id) {
  await requireUser();
  await connectDB();
  await Order.deleteMany({ customer: id });
  await Customer.findByIdAndDelete(id);
  revalidatePath("/clientes");
  revalidatePath("/pedidos");
  redirect("/clientes");
}
