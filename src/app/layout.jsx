import "./globals.css";

export const metadata = {
  title: "Tienda MongoDB 7",
  description: "Proyecto final con login, CRUDs y MongoDB Atlas"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
