import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteDiagnostico } from "./actions";

export default async function DiagnosticosPage({
  searchParams
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const user = await getAdminPageUser();
  const { fecha } = await searchParams;
  const db = getSupabaseAdmin();

  let query = db
    .from("diagnosticos_ia")
    .select("*,profiles(nombre,username)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (fecha) {
    query = query.gte("created_at", `${fecha}T00:00:00`).lte("created_at", `${fecha}T23:59:59`);
  }

  const { data: diagnosticos } = await query;

  const statsPorDia: Record<string, number> = {};
  for (const d of diagnosticos ?? []) {
    const dia = String(d.created_at).slice(0, 10);
    statsPorDia[dia] = (statsPorDia[dia] ?? 0) + 1;
  }
  const diasOrdenados = Object.entries(statsPorDia).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <AdminShell
      user={user}
      title="Diagnósticos IA"
      subtitle="Registro de análisis de plantas y tendencia de salud."
    >
      <form method="get" className="row g-2 mb-3 align-items-end">
        <div className="col-auto">
          <label className="form-label small">Filtrar por fecha</label>
          <input type="date" name="fecha" className="form-control form-control-sm" defaultValue={fecha ?? ""} />
        </div>
        <div className="col-auto">
          <button className="btn btn-agro btn-sm">Filtrar</button>{" "}
          <Link href="/admin/diagnosticos" className="btn btn-outline-secondary btn-sm">
            Ver todos
          </Link>
        </div>
      </form>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card p-3">
            <small className="text-muted">Total (vista actual)</small>
            <div className="stat-value">{(diagnosticos ?? []).length}</div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="table-card">
            <h2 className="h6 fw-bold mb-2">Diagnósticos por día</h2>
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {diasOrdenados.slice(0, 14).map(([dia, cnt]) => (
                  <tr key={dia}>
                    <td>
                      <Link href={`/admin/diagnosticos?fecha=${dia}`}>{dia}</Link>
                    </td>
                    <td>
                      <span className="badge bg-success">{cnt}</span>
                    </td>
                  </tr>
                ))}
                {diasOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-muted">
                      Sin datos
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Modelo</th>
              <th>Severidad</th>
              <th>Resumen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(diagnosticos ?? []).map((d) => {
              const prof = d.profiles as { nombre?: string; username?: string } | null;
              return (
                <tr key={d.id}>
                  <td>{String(d.created_at).slice(0, 16)}</td>
                  <td>{prof?.nombre ?? prof?.username ?? "—"}</td>
                  <td>{d.modelo}</td>
                  <td>
                    <span className="badge bg-secondary">{d.severidad}</span>
                  </td>
                  <td className="small">{String(d.resumen ?? "").slice(0, 120)}</td>
                  <td>
                    <form action={deleteDiagnostico}>
                      <input type="hidden" name="id" value={d.id} />
                      {fecha ? <input type="hidden" name="fecha" value={fecha} /> : null}
                      <ConfirmDeleteButton />
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
