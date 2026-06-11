import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAction, registerAction } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth">
        <h1>NovaPOS</h1>
        <p>
          Acceso al punto de venta, inventario, clientes y pedidos.
        </p>

        {params?.error && (
          <div className="error">Email o contrasena incorrectos.</div>
        )}
        {params?.registerError && (
          <div className="error">
            No se pudo registrar. Usa un email distinto y una contrasena de 8
            caracteres o mas.
          </div>
        )}

        <div className="auth-grid">
          <form action={loginAction} className="form">
            <h2>Iniciar sesion</h2>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue="demo@demo.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contrasena</label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue="Demo1234"
                required
              />
            </div>
            <button className="button" type="submit">
              Entrar
            </button>
          </form>

          <form action={registerAction} className="form">
            <h2>Registro</h2>
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" minLength="2" required />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input id="register-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="register-password">Contrasena</label>
              <input
                id="register-password"
                name="password"
                type="password"
                minLength="8"
                required
              />
            </div>
            <button className="button secondary" type="submit">
              Crear cuenta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
