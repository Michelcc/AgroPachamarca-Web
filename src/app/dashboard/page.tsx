import { AdminShell } from "@/components/AdminShell";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { colorPrestamo, diasTranscurridos } from "@/lib/utils";
import { PrestamosChart } from "./PrestamosChart";

export default async function DashboardPage() {
  const user = await getAdminPageUser();
  const db = getSupabaseAdmin();

  let errorDash = "";
  let totalUsuarios = 0;
  let totalTablas = 0;
  let totalProductos = 0;
  let totalCarpetas = 0;
  let prestamosActivos: Record<string, unknown>[] = [];
  let ultimosMovimientos: Record<string, unknown>[] = [];
  const prestamosMes: Record<string, number> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    prestamosMes[mes] = 0;
  }

  try {
    const [u, t, p, c, prest, mov, todos] = await Promise.all([
      db.from("usuarios").select("id", { count: "exact", head: true }),
      db
        .from("catalogo_tablas")
        .select("id", { count: "exact", head: true })
        .eq("activo", true),
      db.from("productos").select("id", { count: "exact", head: true }),
      db.from("carpetas").select("id", { count: "exact", head: true }),
      db
        .from("prestamos")
        .select("*,carpetas(numero,imputado)")
        .eq("activo", true)
        .order("fecha_prestamo", { ascending: false })
        .limit(50),
      db
        .from("historial_movimientos")
        .select("*,carpetas(numero)")
        .order("fecha", { ascending: false })
        .limit(5),
      db
        .from("prestamos")
        .select("fecha_prestamo")
        .order("fecha_prestamo", { ascending: false })
        .limit(500)
    ]);

    totalUsuarios = u.count ?? 0;
    totalTablas = t.count ?? 0;
    totalProductos = p.count ?? 0;
    totalCarpetas = c.count ?? 0;
    prestamosActivos = prest.data ?? [];
    ultimosMovimientos = mov.data ?? [];

    for (const row of todos.data ?? []) {
      const fp = String(row.fecha_prestamo ?? "").slice(0, 7);
      if (fp in prestamosMes) prestamosMes[fp]++;
    }
  } catch (e) {
    errorDash = e instanceof Error ? e.message : "Error de datos";
  }

  const stats = [
    ["Usuarios panel", totalUsuarios, "👥"],
    ["Tablas activas", totalTablas, "📋"],
    ["Productos", totalProductos, "📦"],
    ["Carpetas", totalCarpetas, "📁"]
  ];

  return (
    <AdminShell user={user} title="Dashboard">
      {errorDash ? (
        <div className="alert alert-warning">
          Algunos datos no cargaron: {errorDash}. ¿Ejecutaste sql/schema.sql en
          Supabase?
        </div>
      ) : null}

      <div className="row g-3 mb-4">
        {stats.map(([label, val, icon]) => (
          <div key={String(label)} className="col-md-3 col-6">
            <div className="card stat-card p-3">
              <small className="text-muted">
                {icon} {label}
              </small>
              <div className="stat-value">{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-card">
            <h2 className="h6 fw-bold mb-3">
              Préstamos activos ({prestamosActivos.length})
            </h2>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Carpeta</th>
                    <th>Solicitante</th>
                    <th>Fecha</th>
                    <th>Días</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosActivos.map((p) => {
                    const fp = String(p.fecha_prestamo ?? "");
                    const dias = diasTranscurridos(fp);
                    const carp = p.carpetas as { numero?: string } | null;
                    return (
                      <tr key={String(p.id)}>
                        <td>{carp?.numero ?? "—"}</td>
                        <td>{String(p.solicitante)}</td>
                        <td>{fp.slice(0, 10)}</td>
                        <td>
                          <span className={`badge bg-${colorPrestamo(dias)}`}>
                            {dias}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card mb-4">
            <h2 className="h6 fw-bold mb-3">Préstamos por mes</h2>
            <div style={{ height: 200 }}>
              <PrestamosChart
                labels={Object.keys(prestamosMes)}
                data={Object.values(prestamosMes)}
              />
            </div>
          </div>
          <div className="table-card">
            <h2 className="h6 fw-bold mb-3">Últimos movimientos</h2>
            <ul className="list-group list-group-flush">
              {ultimosMovimientos.map((m) => {
                const carp = m.carpetas as { numero?: string } | null;
                return (
                  <li key={String(m.id)} className="list-group-item px-0 small">
                    <strong>{String(m.tipo)}</strong> · {carp?.numero ?? ""}
                    <br />
                    <span className="text-muted">
                      {String(m.fecha ?? "").slice(0, 16)}
                    </span>
                  </li>
                );
              })}
              {ultimosMovimientos.length === 0 ? (
                <li className="list-group-item px-0 text-muted">
                  Sin movimientos aún
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
