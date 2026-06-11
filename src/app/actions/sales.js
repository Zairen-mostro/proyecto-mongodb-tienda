"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";

function productStatus(stock) {
  if (stock <= 0) return "Agotado";
  if (stock <= 5) return "Bajo stock";
  return "Disponible";
}

export async function createSaleAction(formData) {
  await requireUser();
  await connectDB();

  const customerId = String(formData.get("customer") || "");
  const productId = String(formData.get("product") || "");
  const quantity = Number(formData.get("quantity") || 0);
  const notes = String(formData.get("notes") || "").trim();

  const [customer, product] = await Promise.all([
    Customer.findById(customerId),
    Product.findById(productId)
  ]);

  if (!customer || !product || quantity < 1 || product.stock < quantity) {
    redirect("/venta?error=stock");
  }

  product.stock -= quantity;
  product.status = productStatus(product.stock);
  await product.save();

  await Order.create({
    customer: customer._id,
    productRef: product._id,
    product: product.name,
    quantity,
    unitPrice: product.price,
    status: "Pagado",
    notes
  });

  revalidatePath("/venta");
  revalidatePath("/dashboard");
  revalidatePath("/pedidos");
  revalidatePath("/productos");
  redirect("/venta?success=1");
}
