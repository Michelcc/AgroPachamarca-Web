export function PageFlash({
  ok,
  error
}: {
  ok?: string | null;
  error?: string | null;
}) {
  const okMessages: Record<string, string> = {
    created: "Registro creado correctamente.",
    updated: "Cambios guardados.",
    deleted: "Registro eliminado.",
    mobile_created: "Usuario de la app creado."
  };

  if (error) {
    return (
      <div className="alert alert-danger page-flash" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (ok && okMessages[ok]) {
    return <div className="alert alert-success page-flash">{okMessages[ok]}</div>;
  }

  return null;
}
