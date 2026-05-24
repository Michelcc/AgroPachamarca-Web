import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createAlerta, updateAlerta, toggleAlerta, deleteAlerta } from "./actions";

const NIVELES: Record<string, string> = {
  info: "Info",
  advertencia: "Advertencia",
  critico: "Crítico"
};

function badgeClass(nivel: string) {
  if (nivel === "critico") return "danger";
  if (nivel === "advertencia") return "warning";
  return "info";
}

export default async function AlertasPage() {
  const user = await getAdminPageUser();
  const { data: alertas } = await getSupabaseAdmin()
    .from("alertas_climaticas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminShell user={user} title="Alertas climáticas">
      <div className="d-flex justify-content-between mb-3">
        <p className="text-muted mb-0">Alertas globales visibles en la app móvil</p>
        <DialogTrigger label="+ Nueva alerta" dialogId="modal-create-alerta" />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Nivel</th>
              <th>Ubicación</th>
              <th>Activo</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(alertas ?? []).map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.titulo}</strong>
                  <div className="small text-muted">
                    {a.mensaje.length > 80 ? `${a.mensaje.slice(0, 80)}…` : a.mensaje}
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${badgeClass(a.nivel)}`}>
                    {NIVELES[a.nivel] ?? a.nivel}
                  </span>
                </td>
                <td>
                  {a.lat != null && a.lng != null
                    ? `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`
                    : "—"}
                </td>
                <td>
                  <form action={toggleAlerta}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className={`btn btn-sm btn-${a.activo ? "agro" : "outline-secondary"}`}
                    >
                      {a.activo ? "Activa" : "Inactiva"}
                    </button>
                  </form>
                </td>
                <td>{String(a.created_at).slice(0, 10)}</td>
                <td>
                  <DialogTrigger label="Editar" dialogId={`edit-alerta-${a.id}`} />
                  <form action={deleteAlerta} className="d-inline" style={{ marginLeft: 4 }}>
                    <input type="hidden" name="id" value={a.id} />
                    <ConfirmDeleteButton />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog id="modal-create-alerta" title="Nueva alerta">
        <form action={createAlerta}>
          <div className="modal-body">
            <input className="form-control mb-2" name="titulo" placeholder="Título" required />
            <textarea className="form-control mb-2" name="mensaje" rows={3} required />
            <select className="form-select mb-2" name="nivel" defaultValue="info">
              {Object.entries(NIVELES).map(([k, lbl]) => (
                <option key={k} value={k}>
                  {lbl}
                </option>
              ))}
            </select>
            <div className="row mb-2">
              <div className="col">
                <input className="form-control" name="lat" type="number" step="any" placeholder="Latitud" />
              </div>
              <div className="col">
                <input className="form-control" name="lng" type="number" step="any" placeholder="Longitud" />
              </div>
            </div>
            <label className="form-check">
              <input type="checkbox" name="activo" defaultChecked /> Activo
            </label>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-agro">
              Crear
            </button>
          </div>
        </form>
      </Dialog>

      {(alertas ?? []).map((a) => (
        <Dialog key={a.id} id={`edit-alerta-${a.id}`} title="Editar alerta">
          <form action={updateAlerta}>
            <input type="hidden" name="id" value={a.id} />
            <div className="modal-body">
              <input className="form-control mb-2" name="titulo" defaultValue={a.titulo} required />
              <textarea className="form-control mb-2" name="mensaje" rows={3} defaultValue={a.mensaje} required />
              <select className="form-select mb-2" name="nivel" defaultValue={a.nivel}>
                {Object.entries(NIVELES).map(([k, lbl]) => (
                  <option key={k} value={k}>
                    {lbl}
                  </option>
                ))}
              </select>
              <div className="row mb-2">
                <div className="col">
                  <input className="form-control" name="lat" type="number" step="any" defaultValue={a.lat ?? ""} />
                </div>
                <div className="col">
                  <input className="form-control" name="lng" type="number" step="any" defaultValue={a.lng ?? ""} />
                </div>
              </div>
              <label className="form-check">
                <input type="checkbox" name="activo" defaultChecked={a.activo} /> Activo
              </label>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-agro">
                Guardar
              </button>
            </div>
          </form>
        </Dialog>
      ))}
    </AdminShell>
  );
}
