import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { createSaleAction } from "@/app/actions/sales";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { date, money } from "@/lib/format";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";

export default async function SalePage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  await connectDB();

  const [customers, products, recentOrders] = await Promise.all([
    Customer.find({ status: "Activo" }).sort({ name: 1 }).lean(),
    Product.find({ stock: { $gt: 0 } }).sort({ name: 1 }).lean(),
    Order.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
  ]);

  const dailyTotal = recentOrders
    .filter((order) => order.status === "Pagado")
    .reduce((sum, order) => sum + order.quantity * order.unitPrice, 0);

  return (
    <AppShell user={user}>
      <div className="pos-layout">
        <section className="pos-ticket">
          <div className="ticket-head">
            <div>
              <p className="eyebrow">Caja</p>
              <h1>Nueva venta</h1>
            </div>
            <div className="ticket-total">{money(dailyTotal)}</div>
          </div>

          {params?.success && <div className="notice success">Venta registrada.</div>}
          {params?.error && <div className="notice error-soft">Stock insuficiente.</div>}

          <form action={createSaleAction} className="form pos-form">
            <div className="field">
              <label htmlFor="customer">Cliente</label>
              <select id="customer" name="customer" required>
                <option value="">Selecciona cliente</option>
                {customers.map((customer) => (
                  <option key={customer._id.toString()} value={customer._id.toString()}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="product">Producto</label>
              <select id="product" name="product" required>
                <option value="">Selecciona producto</option>
                {products.map((product) => (
                  <option key={product._id.toString()} value={product._id.toString()}>
                    {product.name} · {money(product.price)} · stock {product.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="quantity">Cantidad</label>
              <input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
            </div>
            <div className="field">
              <label htmlFor="notes">Notas</label>
              <textarea id="notes" name="notes" placeholder="Metodo de pago, referencia o comentario" />
            </div>
            <button className="button pos-button" type="submit">
              Cobrar venta
            </button>
          </form>
        </section>

        <section className="pos-side">
          <article className="card">
            <div className="section-title">
              <div>
                <h2>Productos disponibles</h2>
                <p className="muted">{products.length} listos para venta</p>
              </div>
              <Link className="button secondary" href="/productos">
                Catalogo
              </Link>
            </div>
            <div className="product-list">
              {products.slice(0, 8).map((product) => (
                <div className="product-row" key={product._id.toString()}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                  <div>
                    <strong>{money(product.price)}</strong>
                    <span>{product.stock} pzas</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-title">
              <h2>Ultimas ventas</h2>
            </div>
            <div className="product-list">
              {recentOrders.map((order) => (
                <Link
                  className="product-row"
                  href={`/pedidos/${order._id}`}
                  key={order._id.toString()}
                >
                  <div>
                    <strong>{order.product}</strong>
                    <span>{order.customer?.name || "Cliente eliminado"}</span>
                  </div>
                  <div>
                    <strong>{money(order.quantity * order.unitPrice)}</strong>
                    <span>{date(order.createdAt)}</span>
                  </div>
                  <StatusBadge>{order.status}</StatusBadge>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
