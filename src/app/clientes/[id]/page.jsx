import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import { CustomerFields } from "@/app/clientes/page";
import { deleteCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { date, money } from "@/lib/format";

export default async function CustomerDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  await connectDB();

  const [customer, orders] = await Promise.all([
    Customer.findById(id).lean(),
    Order.find({ customer: id }).sort({ createdAt: -1 }).lean()
  ]);

  if (!customer) notFound();

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>{customer.name}</h1>
          <p>Detalle leido desde MongoDB y formulario de actualizacion.</p>
        </div>
        <Link className="button secondary" href="/clientes">
          Volver
        </Link>
      </div>

      <section className="grid">
        <form action={updateCustomerAction.bind(null, id)} className="form">
          <h2>Editar cliente</h2>
          <CustomerFields customer={customer} />
          <div className="actions">
            <button className="button" type="submit">
              Actualizar
            </button>
          </div>
        </form>

        <article className="card">
          <h2>Pedidos relacionados</h2>
          {orders.map((order) => (
            <p key={order._id.toString()}>
              <Link href={`/pedidos/${order._id}`}>{order.product}</Link>{" "}
              <span className="badge">{order.status}</span>
              <br />
              {order.quantity} x {money(order.unitPrice)} · {date(order.createdAt)}
            </p>
          ))}
          {orders.length === 0 && <p className="muted">Este cliente aun no tiene pedidos.</p>}
          <form action={deleteCustomerAction.bind(null, id)}>
            <DeleteButton>Eliminar cliente y sus pedidos</DeleteButton>
          </form>
        </article>
      </section>
    </AppShell>
  );
}
