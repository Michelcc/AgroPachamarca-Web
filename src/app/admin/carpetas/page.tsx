import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { colorPrestamo, diasTranscurridos, ESTADOS_CARPETA } from "@/lib/utils";
import { CarpetasIngreso } from "./CarpetasIngreso";
import { desarchivarCarpeta, devolverCarpeta, prestarCarpeta } from "./actions";

type Tab = "ingreso" | "consulta" | "prestamos" | "devueltas" | "historial";

export default async function CarpetasPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; numero?: string; estado?: string; fiscalia_id?: string }>;
}) {
  const user = await getAdminPageUser();
  const sp = await searchParams;
  const tab = (sp.tab as Tab) || "consulta";
  const filtroNum = (sp.numero ?? "").trim();
  const filtroEstado = sp.estado ?? "";
  const filtroFiscalia = sp.fiscalia_id ?? "";
  const db = getSupabaseAdmin();

  const [{ data: fiscalias }, { data: carpetasRaw }, { data: prestamosActivos }, { data: prestamosDevueltos }, { data: historial }] =
    await Promise.all([
      db.from("fiscalias").select("*").eq("activo", true).order("nombre"),
      db
        .from("carpetas")
        .select("*,fiscalias(nombre),despachos(nombre)")
        .order("numero")
        .limit(500),
      db
        .from("prestamos")
        .select("*,carpetas(numero,imputado,delito)")
        .eq("activo", true)
        .order("fecha_prestamo"),
      db
        .from("prestamos")
        .select("*,carpetas(numero,imputado)")
        .eq("activo", false)
        .order("fecha_devolucion", { ascending: false })
        .limit(100),
      db
        .from("historial_movimientos")
        .select("*,carpetas(numero),usuarios(nombre)")
        .order("fecha", { ascending: false })
        .limit(200)
    ]);

  let carpetas = carpetasRaw ?? [];
  if (filtroNum) {
    const q = filtroNum.toLowerCase();
    carpetas = carpetas.filter(
      (c) =>
        c.numero.toLowerCase().includes(q) || c.imputado.toLowerCase().includes(q)
    );
  }
  if (filtroEstado) carpetas = carpetas.filter((c) => c.estado === filtroEstado);
  if (filtroFiscalia) carpetas = carpetas.filter((c) => c.fiscalia_id === filtroFiscalia);

  const prestamoPorCarpeta: Record<string, { fecha_prestamo: string }> = {};
  for (const p of prestamosActivos ?? []) {
    prestamoPorCarpeta[p.carpeta_id] = { fecha_prestamo: p.fecha_prestamo };
  }

  const histByCarpeta = (carpetaId: string) =>
    (historial ?? []).filter((h) => h.carpeta_id === carpetaId);

  const tabLink = (t: Tab, label: string) => (
    <li className="nav-item">
      <Link
        href={`/admin/carpetas?tab=${t}`}
        className={`nav-link ${tab === t ? "active" : ""}`}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <AdminShell user={user} title="Carpetas fiscales">
      <ul className="nav-tabs" style={{ display: "flex", listStyle: "none", padding: 0 }}>
        {tabLink("ingreso", "Ingreso")}
        {tabLink("consulta", "Consulta")}
        {tabLink("prestamos", "Préstamos activos")}
        {tabLink("devueltas", "Devueltas")}
        {tabLink("historial", "Historial")}
      </ul>

      {tab === "ingreso" ? <CarpetasIngreso fiscalias={fiscalias ?? []} /> : null}

      {tab === "consulta" ? (
        <>
          <form method="get" className="row g-2 mb-3">
            <input type="hidden" name="tab" value="consulta" />
            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                name="numero"
                placeholder="Número / imputado"
                defaultValue={filtroNum}
              />
            </div>
            <div className="col-md-2">
              <select name="estado" className="form-select form-select-sm" defaultValue={filtroEstado}>
                <option value="">Estado</option>
                {ESTADOS_CARPETA.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select name="fiscalia_id" className="form-select form-select-sm" defaultValue={filtroFiscalia}>
                <option value="">Fiscalía</option>
                {(fiscalias ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-agro btn-sm">Buscar</button>
            </div>
          </form>
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Imputado</th>
                  <th>Delito</th>
                  <th>Fiscalía</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carpetas.map((c) => {
                  const prest = prestamoPorCarpeta[c.id];
                  const diasPrestamo = prest ? diasTranscurridos(prest.fecha_prestamo) : null;
                  const fiscalia = c.fiscalias as { nombre?: string } | null;
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.numero}</strong>
                      </td>
                      <td>{c.imputado}</td>
                      <td>{c.delito}</td>
                      <td>{fiscalia?.nombre ?? "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{c.estado}</span>
                        {diasPrestamo !== null ? (
                          <span className={`badge bg-${colorPrestamo(diasPrestamo)}`} style={{ marginLeft: 4 }}>
                            {diasPrestamo} d
                          </span>
                        ) : null}
                      </td>
                      <td className="text-nowrap">
                        {(c.estado === "Archivo Central" || c.estado === "Devuelta") && (
                          <DialogTrigger label="Prestar" dialogId={`prestar-${c.id}`} className="btn btn-sm btn-outline-warning" />
                        )}
                        {c.estado === "Prestada" && (
                          <DialogTrigger label="Devolver" dialogId={`devolver-${c.id}`} className="btn btn-sm btn-outline-success" />
                        )}
                        <DialogTrigger label="Desarchivar" dialogId={`desarch-${c.id}`} className="btn btn-sm btn-outline-info" />
                        <DialogTrigger label="Historial" dialogId={`hist-${c.id}`} className="btn btn-sm btn-outline-secondary" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {carpetas.map((c) => (
            <div key={c.id}>
              <Dialog id={`prestar-${c.id}`} title={`Prestar ${c.numero}`}>
                <form action={prestarCarpeta}>
                  <input type="hidden" name="carpeta_id" value={c.id} />
                  <div className="modal-body">
                    <input className="form-control mb-2" name="fiscalia_solicitante" placeholder="Fiscalía solicitante" required />
                    <input className="form-control mb-2" name="solicitante" placeholder="Solicitante" required />
                    <textarea className="form-control" name="motivo" rows={2} placeholder="Motivo" />
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-agro">
                      Confirmar préstamo
                    </button>
                  </div>
                </form>
              </Dialog>
              <Dialog id={`devolver-${c.id}`} title={`Devolver ${c.numero}`}>
                <form action={devolverCarpeta}>
                  <input type="hidden" name="carpeta_id" value={c.id} />
                  <div className="modal-body">
                    <p>¿Confirmar devolución de la carpeta al archivo?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      Devolver
                    </button>
                  </div>
                </form>
              </Dialog>
              <Dialog id={`desarch-${c.id}`} title={`Desarchivar ${c.numero}`}>
                <form action={desarchivarCarpeta}>
                  <input type="hidden" name="carpeta_id" value={c.id} />
                  <div className="modal-body">
                    <textarea className="form-control" name="motivo" rows={2} placeholder="Motivo" required />
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-agro">
                      Desarchivar
                    </button>
                  </div>
                </form>
              </Dialog>
              <Dialog id={`hist-${c.id}`} title={`Historial · ${c.numero}`}>
                <div className="modal-body">
                  <ul className="list-group list-group-flush">
                    {histByCarpeta(c.id).map((h) => {
                      const usr = h.usuarios as { nombre?: string } | null;
                      return (
                        <li key={h.id} className="list-group-item px-0">
                          <strong>{h.tipo}</strong> — {h.descripcion}
                          <br />
                          <small className="text-muted">
                            {String(h.fecha).slice(0, 16)} · {usr?.nombre ?? "Sistema"}
                          </small>
                        </li>
                      );
                    })}
                    {histByCarpeta(c.id).length === 0 ? (
                      <li className="text-muted">Sin movimientos</li>
                    ) : null}
                  </ul>
                </div>
              </Dialog>
            </div>
          ))}
        </>
      ) : null}

      {tab === "prestamos" ? (
        <div className="table-card">
          <h2 className="h6 fw-bold mb-3">Préstamos activos ({(prestamosActivos ?? []).length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Carpeta</th>
                <th>Solicitante</th>
                <th>Fiscalía</th>
                <th>Días</th>
                <th>Fecha préstamo</th>
              </tr>
            </thead>
            <tbody>
              {(prestamosActivos ?? []).map((p) => {
                const dias = diasTranscurridos(p.fecha_prestamo);
                const car = p.carpetas as { numero?: string; imputado?: string } | null;
                return (
                  <tr key={p.id} className={colorPrestamo(dias) === "danger" ? "table-danger" : ""}>
                    <td>
                      {car?.numero} · {car?.imputado}
                    </td>
                    <td>{p.solicitante}</td>
                    <td>{p.fiscalia_solicitante}</td>
                    <td>
                      <span className={`badge bg-${colorPrestamo(dias)}`}>{dias} días</span>
                    </td>
                    <td>{String(p.fecha_prestamo).slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "devueltas" ? (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Carpeta</th>
                <th>Solicitante</th>
                <th>Prestado</th>
                <th>Devuelto</th>
              </tr>
            </thead>
            <tbody>
              {(prestamosDevueltos ?? []).map((p) => {
                const car = p.carpetas as { numero?: string } | null;
                return (
                  <tr key={p.id}>
                    <td>{car?.numero}</td>
                    <td>{p.solicitante}</td>
                    <td>{String(p.fecha_prestamo).slice(0, 10)}</td>
                    <td>{String(p.fecha_devolucion ?? "").slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "historial" ? (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Carpeta</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {(historial ?? []).map((h) => {
                const carp = h.carpetas as { numero?: string } | null;
                const usr = h.usuarios as { nombre?: string } | null;
                return (
                  <tr key={h.id}>
                    <td>{String(h.fecha).slice(0, 16)}</td>
                    <td>{carp?.numero}</td>
                    <td>{h.tipo}</td>
                    <td>{h.descripcion}</td>
                    <td>{usr?.nombre ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}
