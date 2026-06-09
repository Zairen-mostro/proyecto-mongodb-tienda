const statusClass = {
  Activo: "success",
  Inactivo: "neutral",
  Pendiente: "warning",
  Pagado: "success",
  Enviado: "info",
  Cancelado: "danger"
};

export default function StatusBadge({ children }) {
  return (
    <span className={`badge ${statusClass[children] || "neutral"}`}>
      {children}
    </span>
  );
}
