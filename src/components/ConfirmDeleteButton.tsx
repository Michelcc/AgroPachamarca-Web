"use client";

export function ConfirmDeleteButton({ label = "Eliminar" }: { label?: string }) {
  return (
    <button
      type="submit"
      className="btn btn-sm btn-outline-danger"
      onClick={(e) => {
        if (!confirm("¿Eliminar?")) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
