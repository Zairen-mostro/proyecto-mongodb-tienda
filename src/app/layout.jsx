import "./globals.css";

export const metadata = {
  title: "NovaPOS",
  description: "Sistema de punto de venta"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
