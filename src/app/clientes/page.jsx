import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { createCustomerAction, deleteCustomerAction } from "@/app/actions/customers";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function CustomersPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = String(params?.q || "").trim();
  await connectDB();

  const filter = q
    ? {
        $or: [
          { name: new RegExp(escapeRegex(q), "i") },
          { email: new RegExp(escapeRegex(q), "i") },
          { phone: new RegExp(escapeRegex(q), "i") }
        ]
      }
    : {};
  const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
  const orderCounts = await Order.aggregate([
    { $group: { _id: "$customer", total: { $sum: 1 } } }
  ]);
  const counts = new Map(orderCounts.map((item) => [item._id.toString(), item.total]));

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>Clientes</h1>
          <p>Entidad 1. Cada cliente puede tener varios pedidos.</p>
        </div>
      </div>

      <section className="model-strip">
        <div>
          <strong>Coleccion:</strong> customers
        </div>
        <div>
          <strong>Indice:</strong> email unico
        </div>
        <div>
          <strong>Relacion:</strong> orders.customer referencia a este documento
        </div>
      </section>

      <section className="workspace-grid">
        <form action={createCustomerAction} className="form">
          <h2>Nuevo cliente</h2>
          <CustomerFields />
          <button className="button" type="submit">
            Guardar cliente
          </button>
        </form>

        <div className="table-card">
          <div className="toolbar">
            <form className="search" action="/clientes">
              <input
                aria-label="Buscar clientes"
                name="q"
                placeholder="Buscar por nombre, email o telefono"
                defaultValue={q}
              />
              <button className="button secondary" type="submit">
                Buscar
              </button>
            </form>
            {q && (
              <Link className="button secondary" href="/clientes">
                Limpiar
              </Link>
            )}
          </div>
          <div className="table-wrap embedded">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Pedidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id.toString()}>
                  <td>
                    <Link href={`/clientes/${customer._id}`}>{customer.name}</Link>
                    <br />
                    <StatusBadge>{customer.status}</StatusBadge>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{counts.get(customer._id.toString()) || 0}</td>
                  <td>
                    <div className="actions">
                      <Link className="button secondary" href={`/clientes/${customer._id}`}>
                        Ver
                      </Link>
                      <form action={deleteCustomerAction.bind(null, customer._id.toString())}>
                        <DeleteButton />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5">No hay clientes que coincidan con la busqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export function CustomerFields({ customer }) {
  return (
    <>
      <div className="field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" defaultValue={customer?.name} minLength="2" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={customer?.email} required />
      </div>
      <div className="field">
        <label htmlFor="phone">Telefono</label>
        <input id="phone" name="phone" defaultValue={customer?.phone} minLength="7" required />
      </div>
      <div className="field">
        <label htmlFor="status">Estado</label>
        <select id="status" name="status" defaultValue={customer?.status || "Activo"}>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" name="notes" defaultValue={customer?.notes} maxLength="300" />
      </div>
    </>
  );
}
