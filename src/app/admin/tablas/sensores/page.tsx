import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { EmptyTable } from "@/components/EmptyTable";
import { getAdminPageUser } from "@/lib/admin-page";
import { fetchLecturasSensorSuelo } from "@/lib/admin-queries";

function fmt(n: number | null, suffix = "") {
  if (n == null) return "—";
  return `${n}${suffix}`;
}

export default async function TablasSensoresPage() {
  const user = await getAdminPageUser();
  const { data: lecturas, error } = await fetchLecturasSensorSuelo();

  const sensoresUnicos = new Set(lecturas.map((l) => l.sensor_codigo).filter(Boolean)).size;
  const ultima = lecturas[0];

  return (
    <AdminShell
      user={user}
      title="Sensores"
      subtitle="Tablas de datos · lecturas IoT de suelo desde la app móvil."
    >
      {error ? (
        <div className="alert alert-danger">
          Error al cargar: {error}. Ejecuta <code>sql/schema-sensores-suelo.sql</code> en Supabase.
        </div>
      ) : null}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Total lecturas</div>
            <div className="stat-value">{lecturas.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Sensores distintos</div>
            <div className="stat-value">{sensoresUnicos}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Última lectura</div>
            <div className="stat-value" style={{ fontSize: "1rem" }}>
              {ultima ? String(ultima.created_at).slice(0, 16).replace("T", " ") : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Lecturas de suelo</h2>
          <p>
            Tabla <code>lecturas_sensor_suelo</code> · también en{" "}
            <Link href="/admin/dimension/gestion-recursos">Gestión de recursos</Link>
          </p>
        </div>
      </div>

      <div className="table-card">
        {lecturas.length === 0 ? (
          <EmptyTable
            emoji="📡"
            title="Sin lecturas aún"
            message="Los productores registran sensores en la app → Dimensión Gestión de recursos → Sensores."
          />
        ) : (
          <table className="table table-hover-lite">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Humedad</th>
                <th>pH</th>
                <th>Temp.</th>
                <th>CE</th>
                <th>Estado</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {lecturas.map((l) => (
                <tr key={l.id}>
                  <td>
                    <code>{l.sensor_codigo ?? "—"}</code>
                  </td>
                  <td>{fmt(l.humedad_pct, "%")}</td>
                  <td>{fmt(l.ph)}</td>
                  <td>{fmt(l.temperatura_c, " °C")}</td>
                  <td>{fmt(l.conductividad_ms_cm, " mS/cm")}</td>
                  <td>
                    {l.estado_suelo ? (
                      <span className="badge badge-cat">{l.estado_suelo}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="small">
                    {l.profile?.nombre ?? l.profile?.username ?? l.user_id.slice(0, 8)}
                  </td>
                  <td className="small">
                    {String(l.created_at).slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
