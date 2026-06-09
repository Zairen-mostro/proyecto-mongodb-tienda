"use client";

export default function DeleteButton({ children = "Eliminar" }) {
  return (
    <button
      className="button danger"
      type="submit"
      onClick={(event) => {
        if (!confirm("Confirma que quieres eliminar este registro.")) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
