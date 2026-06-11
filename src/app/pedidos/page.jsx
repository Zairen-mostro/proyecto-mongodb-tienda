import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { createOrderAction, deleteOrderAction } from "@/app/actions/orders";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { date, money } from "@/lib/format";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function OrdersPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = String(params?.q || "").trim();
  const status = String(params?.status || "").trim();
  await connectDB();

  const filter = {};
  if (q) filter.product = new RegExp(escapeRegex(q), "i");
  if (status) filter.status = status;

  const [orders, customers, products] = await Promise.all([
    Order.find(filter).populate("customer", "name email").sort({ createdAt: -1 }).lean(),
    Customer.find().sort({ name: 1 }).lean(),
    Product.find().sort({ name: 1 }).lean()
  ]);

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>Pedidos</h1>
          <p>Entidad 2. Cada pedido referencia a un cliente por ObjectId.</p>
        </div>
      </div>

      <section className="model-strip">
        <div>
          <strong>Coleccion:</strong> orders
        </div>
        <div>
          <strong>Referencia:</strong> customer ObjectId
        </div>
        <div>
          <strong>Indices:</strong> customer + fecha, status
        </div>
      </section>

      <section className="workspace-grid">
        <form action={createOrderAction} className="form">
          <h2>Nuevo pedido</h2>
          <OrderFields customers={customers} products={products} />
          <button className="button" type="submit">
            Guardar pedido
          </button>
        </form>

        <div className="table-card">
          <div className="toolbar">
            <form className="search" action="/pedidos">
              <input
                aria-label="Buscar pedidos"
                name="q"
                placeholder="Buscar producto"
                defaultValue={q}
              />
              <select aria-label="Filtrar estado" name="status" defaultValue={status}>
                <option value="">Todos los estados</option>
                <option>Pendiente</option>
                <option>Pagado</option>
                <option>Enviado</option>
                <option>Cancelado</option>
              </select>
              <button className="button secondary" type="submit">
                Filtrar
              </button>
            </form>
            {(q || status) && (
              <Link className="button secondary" href="/pedidos">
                Limpiar
              </Link>
            )}
          </div>
          <div className="table-wrap embedded">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id.toString()}>
                  <td>
                    <Link href={`/pedidos/${order._id}`}>{order.product}</Link>
                    <br />
                    <span className="muted">{date(order.createdAt)}</span>
                  </td>
                  <td>{order.customer?.name || "Cliente eliminado"}</td>
                  <td>{money(order.quantity * order.unitPrice)}</td>
                  <td>
                    <StatusBadge>{order.status}</StatusBadge>
                  </td>
                  <td>
                    <div className="actions">
                      <Link className="button secondary" href={`/pedidos/${order._id}`}>
                        Ver
                      </Link>
                      <form action={deleteOrderAction.bind(null, order._id.toString())}>
                        <DeleteButton />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5">No hay pedidos que coincidan con el filtro.</td>
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

export function OrderFields({ order, customers, products = [] }) {
  return (
    <>
      <div className="field">
        <label htmlFor="customer">Cliente</label>
        <select
          id="customer"
          name="customer"
          defaultValue={order?.customer?._id?.toString() || order?.customer?.toString() || ""}
          required
        >
          <option value="">Selecciona un cliente</option>
          {customers.map((customer) => (
            <option key={customer._id.toString()} value={customer._id.toString()}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="product">Producto</label>
        <input
          id="product"
          name="product"
          list="product-options"
          defaultValue={order?.product}
          minLength="2"
          required
        />
        <datalist id="product-options">
          {products.map((product) => (
            <option key={product._id.toString()} value={product.name} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label htmlFor="quantity">Cantidad</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          defaultValue={order?.quantity || 1}
          min="1"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="unitPrice">Precio unitario</label>
        <input
          id="unitPrice"
          name="unitPrice"
          type="number"
          step="0.01"
          defaultValue={order?.unitPrice || 0}
          min="0"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="status">Estado</label>
        <select id="status" name="status" defaultValue={order?.status || "Pendiente"}>
          <option>Pendiente</option>
          <option>Pagado</option>
          <option>Enviado</option>
          <option>Cancelado</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" name="notes" defaultValue={order?.notes} maxLength="300" />
      </div>
    </>
  );
}
