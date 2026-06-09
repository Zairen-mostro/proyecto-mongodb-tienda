import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import { OrderFields } from "@/app/pedidos/page";
import { deleteOrderAction, updateOrderAction } from "@/app/actions/orders";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { date, money } from "@/lib/format";

export default async function OrderDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  await connectDB();

  const [order, customers] = await Promise.all([
    Order.findById(id).populate("customer", "name email phone").lean(),
    Customer.find().sort({ name: 1 }).lean()
  ]);

  if (!order) notFound();

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>{order.product}</h1>
          <p>Detalle del pedido, su cliente relacionado y formulario de edicion.</p>
        </div>
        <Link className="button secondary" href="/pedidos">
          Volver
        </Link>
      </div>

      <section className="grid">
        <form action={updateOrderAction.bind(null, id)} className="form">
          <h2>Editar pedido</h2>
          <OrderFields order={order} customers={customers} />
          <button className="button" type="submit">
            Actualizar
          </button>
        </form>

        <article className="card">
          <h2>Relacion con cliente</h2>
          <p>
            <strong>Cliente:</strong>{" "}
            {order.customer ? (
              <Link href={`/clientes/${order.customer._id}`}>{order.customer.name}</Link>
            ) : (
              "Cliente eliminado"
            )}
          </p>
          {order.customer && (
            <p className="muted">
              {order.customer.email} · {order.customer.phone}
            </p>
          )}
          <p>
            <strong>Total:</strong> {money(order.quantity * order.unitPrice)}
          </p>
          <p>
            <strong>Creado:</strong> {date(order.createdAt)}
          </p>
          <form action={deleteOrderAction.bind(null, id)}>
            <DeleteButton>Eliminar pedido</DeleteButton>
          </form>
        </article>
      </section>
    </AppShell>
  );
}
