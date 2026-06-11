"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Product from "@/models/Product";

function productStatus(stock) {
  if (stock <= 0) return "Agotado";
  if (stock <= 5) return "Bajo stock";
  return "Disponible";
}

function productInput(formData) {
  const stock = Number(formData.get("stock") || 0);
  return {
    sku: String(formData.get("sku") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    price: Number(formData.get("price") || 0),
    stock,
    status: productStatus(stock)
  };
}

export async function createProductAction(formData) {
  await requireUser();
  await connectDB();
  await Product.create(productInput(formData));
  revalidatePath("/productos");
  revalidatePath("/venta");
  redirect("/productos");
}

export async function updateProductAction(id, formData) {
  await requireUser();
  await connectDB();
  await Product.findByIdAndUpdate(id, productInput(formData), {
    runValidators: true
  });
  revalidatePath("/productos");
  revalidatePath("/venta");
  redirect(`/productos/${id}`);
}

export async function deleteProductAction(id) {
  await requireUser();
  await connectDB();
  await Product.findByIdAndDelete(id);
  revalidatePath("/productos");
  revalidatePath("/venta");
  redirect("/productos");
}
