import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { ProductFields } from "@/app/productos/page";
import { deleteProductAction, updateProductAction } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { money } from "@/lib/format";
import Product from "@/models/Product";
import Order from "@/models/Order";

export default async function ProductDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  await connectDB();

  const [product, orders] = await Promise.all([
    Product.findById(id).lean(),
    Order.find({ productRef: id })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
  ]);

  if (!product) notFound();

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>{product.name}</h1>
          <p>
            {product.sku} · {product.category}
          </p>
        </div>
        <Link className="button secondary" href="/productos">
          Volver
        </Link>
      </div>

      <section className="grid">
        <form action={updateProductAction.bind(null, id)} className="form">
          <h2>Editar producto</h2>
          <ProductFields product={product} />
          <button className="button" type="submit">
            Actualizar
          </button>
        </form>

        <article className="card">
          <h2>Resumen</h2>
          <p className="big-number">{money(product.price)}</p>
          <p>
            Stock: <strong>{product.stock}</strong>
          </p>
          <StatusBadge>{product.status}</StatusBadge>
          <div className="section-space">
            <form action={deleteProductAction.bind(null, id)}>
              <DeleteButton>Eliminar producto</DeleteButton>
            </form>
          </div>
        </article>
      </section>

      <section className="card section-space">
        <div className="section-title">
          <h2>Movimientos recientes</h2>
        </div>
        <div className="table-wrap embedded">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id.toString()}>
                  <td>{order.customer?.name || "Cliente eliminado"}</td>
                  <td>{order.quantity}</td>
                  <td>{money(order.quantity * order.unitPrice)}</td>
                  <td>
                    <StatusBadge>{order.status}</StatusBadge>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="4">Sin movimientos recientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
