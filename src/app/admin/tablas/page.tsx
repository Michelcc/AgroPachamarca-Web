import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  createTabla,
  updateTabla,
  toggleTabla,
  reorderTabla,
  deleteTabla
} from "./actions";

export default async function TablasPage() {
  const user = await getAdminPageUser();
  const { data: tablas } = await getSupabaseAdmin()
    .from("catalogo_tablas")
    .select("*")
    .order("orden")
    .order("codigo");

  return (
    <AdminShell user={user} title="Tablas de datos">
      <div className="d-flex justify-content-between mb-3">
        <p className="text-muted mb-0">
          Catálogo de tablas de campo para la app móvil ({(tablas ?? []).length} registros)
        </p>
        <DialogTrigger label="+ Nueva tabla" dialogId="modal-create-tabla" />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Icono</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(tablas ?? []).map((t) => (
              <tr key={t.codigo}>
                <td>
                  <form action={reorderTabla} className="d-inline">
                    <input type="hidden" name="codigo" value={t.codigo} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" className="btn btn-sm btn-outline-secondary" title="Subir">
                      ↑
                    </button>
                  </form>{" "}
                  {t.orden ?? 0}{" "}
                  <form action={reorderTabla} className="d-inline">
                    <input type="hidden" name="codigo" value={t.codigo} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" className="btn btn-sm btn-outline-secondary" title="Bajar">
                      ↓
                    </button>
                  </form>
                </td>
                <td>{t.icono ?? "📋"}</td>
                <td>
                  <code>{t.codigo}</code>
                </td>
                <td>{t.nombre_display}</td>
                <td>{t.categoria}</td>
                <td>
                  <form action={toggleTabla}>
                    <input type="hidden" name="codigo" value={t.codigo} />
                    <button
                      type="submit"
                      className={`btn btn-sm btn-${t.activo ? "agro" : "outline-secondary"}`}
                    >
                      {t.activo ? "Activo" : "Inactivo"}
                    </button>
                  </form>
                </td>
                <td className="text-nowrap">
                  <DialogTrigger label="Editar" dialogId={`edit-tabla-${t.codigo}`} />
                  <form action={deleteTabla} className="d-inline" style={{ marginLeft: 4 }}>
                    <input type="hidden" name="codigo" value={t.codigo} />
                    <ConfirmDeleteButton />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog id="modal-create-tabla" title="Nueva tabla">
        <form action={createTabla}>
          <div className="modal-body">
            <input className="form-control mb-2" name="codigo" placeholder="codigo_tabla" required />
            <input className="form-control mb-2" name="categoria" placeholder="Categoría" required />
            <input className="form-control mb-2" name="nombre_display" placeholder="Nombre visible" required />
            <input className="form-control mb-2" name="icono" placeholder="Icono" defaultValue="📋" />
            <input className="form-control mb-2" name="orden" type="number" defaultValue={0} />
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

      {(tablas ?? []).map((t) => (
        <Dialog key={t.codigo} id={`edit-tabla-${t.codigo}`} title={`Editar ${t.codigo}`}>
          <form action={updateTabla}>
            <input type="hidden" name="codigo" value={t.codigo} />
            <div className="modal-body">
              <input className="form-control mb-2" name="categoria" defaultValue={t.categoria} required />
              <input className="form-control mb-2" name="nombre_display" defaultValue={t.nombre_display ?? ""} required />
              <input className="form-control mb-2" name="icono" defaultValue={t.icono ?? "📋"} />
              <input className="form-control mb-2" name="orden" type="number" defaultValue={t.orden ?? 0} />
              <label className="form-check">
                <input type="checkbox" name="activo" defaultChecked={t.activo} /> Activo
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
