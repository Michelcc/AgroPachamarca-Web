import { AdminShell } from "@/components/AdminShell";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function DashboardPage() {
  const user = await getAdminPageUser();
  const db = getSupabaseAdmin();

  let errorDash = "";
  let totalUsuarios = 0;
  let totalTablas = 0;
  let totalProductos = 0;
  let totalRecomendaciones = 0;
  let totalAlertas = 0;
  let totalDiagnosticos = 0;
  let totalGps = 0;

  try {
    const [u, t, p, r, a, d, g] = await Promise.all([
      db.from("usuarios").select("id", { count: "exact", head: true }),
      db
        .from("catalogo_tablas")
        .select("id", { count: "exact", head: true })
        .eq("activo", true),
      db.from("productos").select("id", { count: "exact", head: true }),
      db
        .from("recomendaciones_cultivo")
        .select("id", { count: "exact", head: true })
        .eq("activo", true),
      db
        .from("alertas_climaticas")
        .select("id", { count: "exact", head: true })
        .eq("activo", true),
      db.from("diagnosticos_ia").select("id", { count: "exact", head: true }),
      db.from("registros_gps").select("id", { count: "exact", head: true })
    ]);

    totalUsuarios = u.count ?? 0;
    totalTablas = t.count ?? 0;
    totalProductos = p.count ?? 0;
    totalRecomendaciones = r.count ?? 0;
    totalAlertas = a.count ?? 0;
    totalDiagnosticos = d.count ?? 0;
    totalGps = g.count ?? 0;
  } catch (e) {
    errorDash = e instanceof Error ? e.message : "Error de datos";
  }

  const stats = [
    ["Usuarios panel", totalUsuarios, "👥"],
    ["Tablas de campo", totalTablas, "📋"],
    ["Productos", totalProductos, "📦"],
    ["Recomendaciones", totalRecomendaciones, "🌾"],
    ["Alertas clima", totalAlertas, "☁️"],
    ["Diagnósticos IA", totalDiagnosticos, "🔬"],
    ["Registros GPS", totalGps, "📍"]
  ];

  return (
    <AdminShell user={user} title="Dashboard">
      {errorDash ? (
        <div className="alert alert-warning">
          Algunos datos no cargaron: {errorDash}. ¿Ejecutaste sql/schema.sql en
          Supabase?
        </div>
      ) : null}

      <div className="row g-3">
        {stats.map(([label, val, icon]) => (
          <div key={String(label)} className="col-md-4 col-6">
            <div className="card stat-card p-3">
              <small className="text-muted">
                {icon} {label}
              </small>
              <div className="stat-value">{val}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
