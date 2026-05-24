import { AdminShell } from "@/components/AdminShell";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { GpsMarker } from "./GpsMap";
import { GpsMapWrapper } from "./GpsMapWrapper";

export default async function RegistrosGpsPage({
  searchParams
}: {
  searchParams: Promise<{ user_id?: string; fecha?: string }>;
}) {
  const user = await getAdminPageUser();
  const { user_id: filtroUser, fecha: filtroFecha } = await searchParams;
  const db = getSupabaseAdmin();

  const { data: profiles } = await db
    .from("profiles")
    .select("id,nombre,username")
    .order("nombre")
    .limit(200);

  let errorGps = "";
  let registros: Record<string, unknown>[] = [];
  try {
    let q = db
      .from("registros_gps")
      .select("*,profiles(nombre,username)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (filtroUser) q = q.eq("user_id", filtroUser);
    if (filtroFecha) {
      q = q
        .gte("created_at", `${filtroFecha}T00:00:00`)
        .lte("created_at", `${filtroFecha}T23:59:59`);
    }
    const { data, error } = await q;
    if (error) errorGps = error.message;
    registros = data ?? [];
  } catch (e) {
    errorGps = e instanceof Error ? e.message : "Error";
  }

  let errorCampo = "";
  let campo: Record<string, unknown>[] = [];
  try {
    const { data, error } = await db.rpc("list_registros_campo_gps", { p_limit: 150 });
    if (error) errorCampo = error.message;
    campo = (data as Record<string, unknown>[]) ?? [];
  } catch (e) {
    errorCampo = e instanceof Error ? e.message : "Error RPC";
  }

  if (filtroUser) {
    campo = campo.filter((r) => r.user_id === filtroUser);
  }
  if (filtroFecha) {
    campo = campo.filter((r) => String(r.created_at ?? "").startsWith(filtroFecha));
  }

  const markers: GpsMarker[] = [];
  for (const r of registros) {
    if (r.lat == null || r.lng == null) continue;
    const prof = r.profiles as { nombre?: string; username?: string } | null;
    markers.push({
      lat: Number(r.lat),
      lng: Number(r.lng),
      titulo: String(r.titulo ?? "Registro API"),
      origen: "registros_gps",
      usuario: prof?.nombre ?? prof?.username ?? "",
      fecha: String(r.created_at).slice(0, 16)
    });
  }
  for (const c of campo) {
    if (c.lat == null || c.lng == null) continue;
    markers.push({
      lat: Number(c.lat),
      lng: Number(c.lng),
      titulo: String(c.titulo ?? c.tabla_origen ?? "Campo"),
      origen: String(c.tabla_origen ?? "campo"),
      usuario: String(c.user_id ?? "").slice(0, 8),
      fecha: String(c.created_at ?? "").slice(0, 16)
    });
  }

  type GpsRow = Record<string, unknown> & { _origen: string; created_at?: string };
  const allRows = (
    [
      ...registros.map((r) => ({ ...(r as Record<string, unknown>), _origen: "registros_gps" })),
      ...campo.map((c) => ({ ...(c as Record<string, unknown>), _origen: "campo" }))
    ] as GpsRow[]
  ).sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
  );

  return (
    <AdminShell user={user} title="Registros GPS">
      {errorGps ? <div className="alert alert-warning">Tabla registros_gps: {errorGps}</div> : null}
      {errorCampo ? (
        <div className="alert alert-info small">RPC list_registros_campo_gps: {errorCampo}</div>
      ) : null}

      <form method="get" className="row g-2 mb-3 align-items-end">
        <div className="col-md-4">
          <label className="form-label small">Usuario</label>
          <select name="user_id" className="form-select form-select-sm" defaultValue={filtroUser ?? ""}>
            <option value="">Todos</option>
            {(profiles ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre ?? p.username}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label small">Fecha</label>
          <input type="date" name="fecha" className="form-control form-control-sm" defaultValue={filtroFecha ?? ""} />
        </div>
        <div className="col-auto">
          <button className="btn btn-agro btn-sm">Filtrar</button>
        </div>
      </form>

      <div className="table-card mb-4">
        <h2 className="h6 fw-bold mb-2">Mapa ({markers.length} puntos)</h2>
        <GpsMapWrapper markers={markers} />
      </div>

      <div className="table-card">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Título</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Altitud</th>
            </tr>
          </thead>
          <tbody>
            {allRows.slice(0, 200).map((r, i) => (
              <tr key={`${r.id ?? i}-${r._origen}`}>
                <td>{String(r.created_at ?? "").slice(0, 16)}</td>
                <td>{String(r._origen)}</td>
                <td>{String(r.titulo ?? r.tabla_origen ?? "—")}</td>
                <td>{r.lat != null ? Number(r.lat).toFixed(5) : "—"}</td>
                <td>{r.lng != null ? Number(r.lng).toFixed(5) : "—"}</td>
                <td>{r.altitud_msnm != null ? Number(r.altitud_msnm).toFixed(0) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
