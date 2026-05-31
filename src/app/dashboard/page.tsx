import Link from "next/link";
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
  let totalIndicadoresOp = 0;

  try {
    const [u, t, p, r, a, d, io] = await Promise.all([
      db.from("usuarios").select("id", { count: "exact", head: true }),
      db.from("catalogo_tablas").select("id", { count: "exact", head: true }).eq("activo", true),
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
      db.from("indicadores_operacionalizacion").select("id", { count: "exact", head: true })
    ]);

    totalUsuarios = u.count ?? 0;
    totalTablas = t.count ?? 0;
    totalProductos = p.count ?? 0;
    totalRecomendaciones = r.count ?? 0;
    totalAlertas = a.count ?? 0;
    totalDiagnosticos = d.count ?? 0;
    totalIndicadoresOp = io.count ?? 0;
  } catch (e) {
    errorDash = e instanceof Error ? e.message : "Error de datos";
  }

  const stats = [
    { label: "Tablas de campo activas", value: totalTablas, href: "/admin/tablas", trend: "Catálogo operativo" },
    { label: "Usuarios panel", value: totalUsuarios, href: "/admin/usuarios", trend: "Acceso administrativo" },
    { label: "Productos", value: totalProductos, href: "/admin/tablas/productos", trend: "Inventario" },
    { label: "Recomendaciones", value: totalRecomendaciones, href: "/admin/recomendaciones", trend: "ML cultivos" },
    { label: "Alertas clima", value: totalAlertas, href: "/admin/alertas", trend: "Monitoreo" },
    { label: "Variables tesis", value: totalIndicadoresOp, href: "/admin/operacionalizacion", trend: "Operacionalización" },
    { label: "Diagnósticos IA", value: totalDiagnosticos, href: "/admin/diagnosticos", trend: "Visión IA" }
  ];

  return (
    <AdminShell
      user={user}
      title="Dashboard"
      subtitle="Bienvenido al Panel Agro — resumen de tu infraestructura digital."
    >
      {errorDash ? (
        <div className="alert alert-warning">
          Algunos datos no cargaron: {errorDash}. ¿Ejecutaste sql/schema.sql en Supabase?
        </div>
      ) : null}

      <div className="page-intro">
        <h2>Panel de control</h2>
        <p>
          Gestiona operaciones agrícolas con precisión basada en datos. Usuarios, tablas de campo,
          productos, recomendaciones ML y alertas climáticas en un solo lugar.
        </p>
      </div>

      <div className="row g-3">
        {stats.map((s) => (
          <div key={s.label} className="col-md-4 col-6">
            <Link href={s.href} className="stat-card-link">
              <div className="card stat-card p-3">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-trend">{s.trend}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
