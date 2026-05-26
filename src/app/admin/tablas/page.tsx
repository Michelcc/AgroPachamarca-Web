import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { TablaFormFields } from "@/components/forms/TablaForm";
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

  const activas = (tablas ?? []).filter((t) => t.activo).length;

  return (
    <AdminShell
      user={user}
      title="Tablas de datos"
      subtitle="Catálogo de esquemas de campo del sistema."
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Total tablas</div>
            <div className="stat-value">{(tablas ?? []).length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Tablas activas</div>
            <div className="stat-value">{activas}</div>
            <div className="stat-trend">
              {tablas?.length ? ((activas / tablas.length) * 100).toFixed(1) : 0}% del total
            </div>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Gestión de tablas de datos</h2>
          <p>Configura diccionarios visibles en la app móvil</p>
        </div>
        <DialogTrigger label="+ Nueva tabla" dialogId="modal-create-tabla" className="btn btn-agro" />
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
                  <DialogTrigger label="Editar" dialogId={`edit-tabla-${t.codigo}`} className="btn btn-sm btn-outline-primary" />
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

      <EnterpriseDialog
        id="modal-create-tabla"
        title="Nueva Tabla de Datos"
        subtitle="Defina los parámetros básicos de la nueva estructura."
      >
        <form action={createTabla}>
          <ModalBody>
            <TablaFormFields />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-tabla" submitLabel="Crear Tabla" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      {(tablas ?? []).map((t) => (
        <EnterpriseDialog
          key={t.codigo}
          id={`edit-tabla-${t.codigo}`}
          title="Editar tabla"
          subtitle={t.codigo}
        >
          <form action={updateTabla}>
            <input type="hidden" name="codigo" value={t.codigo} />
            <ModalBody>
              <TablaFormFields
                isEdit
                defaultValues={{
                  codigo: t.codigo,
                  categoria: t.categoria,
                  nombre_display: t.nombre_display ?? "",
                  icono: t.icono ?? "📋",
                  orden: t.orden ?? 0,
                  activo: t.activo
                }}
              />
            </ModalBody>
            <ModalFooter>
              <ModalActions dialogId={`edit-tabla-${t.codigo}`} submitLabel="Guardar tabla" />
            </ModalFooter>
          </form>
        </EnterpriseDialog>
      ))}
    </AdminShell>
  );
}
