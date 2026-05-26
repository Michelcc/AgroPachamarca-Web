import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { AlertaFormFields } from "@/components/forms/AlertaForm";
import { MlAlertPredictorCard } from "@/components/MlAlertPredictorCard";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createAlerta, updateAlerta, toggleAlerta, deleteAlerta } from "./actions";

const NIVELES: Record<string, string> = {
  info: "Informativo",
  advertencia: "Moderado",
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
    <AdminShell
      user={user}
      title="Alertas climáticas"
      subtitle="Monitoreo en tiempo real y evaluación ML de riesgos."
    >
      <MlAlertPredictorCard />

      <div className="page-toolbar">
        <div>
          <h2>Registro de alertas</h2>
          <p>{(alertas ?? []).length} alertas · visibles en la app móvil</p>
        </div>
        <DialogTrigger label="+ Nueva alerta" dialogId="modal-create-alerta" className="btn btn-agro" />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Nivel</th>
              <th>Ubicación</th>
              <th>Estado</th>
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
                  <DialogTrigger label="Editar" dialogId={`edit-alerta-${a.id}`} className="btn btn-sm btn-outline-primary" />
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

      <EnterpriseDialog
        id="modal-create-alerta"
        title="Nueva alerta climática"
        subtitle="Publica un aviso para productores con nivel de riesgo y ubicación."
      >
        <form action={createAlerta}>
          <ModalBody>
            <AlertaFormFields />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-alerta" submitLabel="Publicar alerta" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      {(alertas ?? []).map((a) => (
        <EnterpriseDialog
          key={a.id}
          id={`edit-alerta-${a.id}`}
          title="Editar alerta"
          subtitle={a.titulo}
        >
          <form action={updateAlerta}>
            <input type="hidden" name="id" value={a.id} />
            <ModalBody>
              <AlertaFormFields
                defaultValues={{
                  titulo: a.titulo,
                  mensaje: a.mensaje,
                  nivel: a.nivel,
                  lat: a.lat,
                  lng: a.lng,
                  activo: a.activo
                }}
              />
            </ModalBody>
            <ModalFooter>
              <ModalActions dialogId={`edit-alerta-${a.id}`} submitLabel="Guardar alerta" />
            </ModalFooter>
          </form>
        </EnterpriseDialog>
      ))}
    </AdminShell>
  );
}
