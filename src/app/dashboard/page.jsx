import Link from "next/link";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { date, money } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default async function DashboardPage() {
  const user = await requireUser();
  await connectDB();

  const [
    customers,
    orders,
    paidOrders,
    recentOrders,
    activeCustomers,
    products,
    lowStock
  ] = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Order.find({ status: "Pagado" }).select("quantity unitPrice").lean(),
    Order.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Customer.countDocuments({ status: "Activo" }),
    Product.countDocuments(),
    Product.countDocuments({ status: { $in: ["Bajo stock", "Agotado"] } })
  ]);

  const sales = paidOrders.reduce(
    (sum, order) => sum + order.quantity * order.unitPrice,
    0
  );

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>Inicio</h1>
          <p>Ventas, inventario y actividad reciente.</p>
        </div>
      </div>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">Caja activa</p>
          <h2>{money(sales)} en ventas pagadas</h2>
          <p>Catalogo, clientes, pedidos e inventario en un solo panel.</p>
        </div>
        <Link className="button" href="/venta">
          Nueva venta
        </Link>
      </section>

      <section className="grid stats-grid">
        <article className="card">
          <h2>Clientes</h2>
          <div className="stat">{customers}</div>
          <p className="muted">{activeCustomers} activos</p>
          <Link className="button secondary" href="/clientes">
            Gestionar clientes
          </Link>
        </article>
        <article className="card">
          <h2>Pedidos</h2>
          <div className="stat">{orders}</div>
          <Link className="button secondary" href="/pedidos">
            Gestionar pedidos
          </Link>
        </article>
        <article className="card">
          <h2>Productos</h2>
          <div className="stat">{products}</div>
          <p className="muted">{lowStock} requieren revision</p>
          <Link className="button secondary" href="/productos">
            Ver catalogo
          </Link>
        </article>
        <article className="card">
          <h2>Ventas pagadas</h2>
          <div className="stat">{money(sales)}</div>
          <p className="muted">Pedidos con estado Pagado.</p>
        </article>
      </section>

      <section className="card section-space">
        <div className="section-title">
          <div>
            <h2>Actividad reciente</h2>
            <p className="muted">Ultimos movimientos de venta.</p>
          </div>
          <Link className="button secondary" href="/pedidos">
            Ver todos
          </Link>
        </div>
        <div className="table-wrap embedded">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id.toString()}>
                  <td>
                    <Link href={`/pedidos/${order._id}`}>{order.product}</Link>
                  </td>
                  <td>{order.customer?.name || "Cliente eliminado"}</td>
                  <td>{money(order.quantity * order.unitPrice)}</td>
                  <td>
                    <StatusBadge>{order.status}</StatusBadge>
                  </td>
                  <td>{date(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
