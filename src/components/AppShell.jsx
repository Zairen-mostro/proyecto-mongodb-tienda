import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default function AppShell({ user, children }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/dashboard">
          NovaPOS
        </Link>
        <nav className="nav">
          <Link href="/venta">Venta</Link>
          <Link href="/dashboard">Inicio</Link>
          <Link href="/productos">Productos</Link>
          <Link href="/clientes">Clientes</Link>
          <Link href="/pedidos">Pedidos</Link>
          <span>{user.email}</span>
          <form action={logoutAction}>
            <button type="submit">Salir</button>
          </form>
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
