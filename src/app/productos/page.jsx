import Link from "next/link";
import AppShell from "@/components/AppShell";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { createProductAction, deleteProductAction } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { money } from "@/lib/format";
import Product from "@/models/Product";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function ProductsPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = String(params?.q || "").trim();
  await connectDB();

  const filter = q
    ? {
        $or: [
          { sku: new RegExp(escapeRegex(q), "i") },
          { name: new RegExp(escapeRegex(q), "i") },
          { category: new RegExp(escapeRegex(q), "i") }
        ]
      }
    : {};

  const products = await Product.find(filter).sort({ name: 1 }).lean();

  return (
    <AppShell user={user}>
      <div className="header">
        <div>
          <h1>Productos</h1>
          <p>Catalogo, precios y existencias.</p>
        </div>
        <Link className="button" href="/venta">
          Nueva venta
        </Link>
      </div>

      <section className="workspace-grid">
        <form action={createProductAction} className="form">
          <h2>Nuevo producto</h2>
          <ProductFields />
          <button className="button" type="submit">
            Guardar producto
          </button>
        </form>

        <div className="table-card">
          <div className="toolbar">
            <form className="search" action="/productos">
              <input
                aria-label="Buscar productos"
                name="q"
                placeholder="Buscar por SKU, producto o categoria"
                defaultValue={q}
              />
              <button className="button secondary" type="submit">
                Buscar
              </button>
            </form>
            {q && (
              <Link className="button secondary" href="/productos">
                Limpiar
              </Link>
            )}
          </div>
          <div className="table-wrap embedded">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id.toString()}>
                    <td>{product.sku}</td>
                    <td>
                      <Link href={`/productos/${product._id}`}>
                        {product.name}
                      </Link>
                      <br />
                      <StatusBadge>{product.status}</StatusBadge>
                    </td>
                    <td>{product.category}</td>
                    <td>{money(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="actions">
                        <Link
                          className="button secondary"
                          href={`/productos/${product._id}`}
                        >
                          Ver
                        </Link>
                        <form
                          action={deleteProductAction.bind(
                            null,
                            product._id.toString()
                          )}
                        >
                          <DeleteButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay productos para mostrar.</td>
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

export function ProductFields({ product }) {
  return (
    <>
      <div className="field">
        <label htmlFor="sku">SKU</label>
        <input id="sku" name="sku" defaultValue={product?.sku} required />
      </div>
      <div className="field">
        <label htmlFor="name">Producto</label>
        <input id="name" name="name" defaultValue={product?.name} minLength="2" required />
      </div>
      <div className="field">
        <label htmlFor="category">Categoria</label>
        <input id="category" name="category" defaultValue={product?.category} required />
      </div>
      <div className="field">
        <label htmlFor="price">Precio</label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.price || 0}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="stock">Stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          defaultValue={product?.stock || 0}
          required
        />
      </div>
    </>
  );
}
