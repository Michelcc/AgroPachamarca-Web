import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { EmptyTable } from "@/components/EmptyTable";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { MlAlertPredictorCard } from "@/components/MlAlertPredictorCard";
import { PageFlash } from "@/components/PageFlash";
import { AlertaFormFields } from "@/components/forms/AlertaForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { fetchAlertasClimaticas } from "@/lib/admin-queries";
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

export default async function AlertasPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await getAdminPageUser();
  const sp = await searchParams;
  const { data: alertas, error: errAlertas } = await fetchAlertasClimaticas();

  const activas = alertas.filter((a) => a.activo).length;
  const criticas = alertas.filter((a) => a.nivel === "critico").length;

  return (
    <AdminShell
      user={user}
      title="Alertas climáticas"
      subtitle="Tabla alertas_climaticas — avisos globales para la app."
    >
      <PageFlash ok={sp.ok} error={sp.error} />

      {errAlertas ? (
        <div className="alert alert-danger">
          Error al cargar: {errAlertas}. Ejecuta <code>web-admin/sql/schema.sql</code> en Supabase.
        </div>
      ) : null}

      <MlAlertPredictorCard />

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Total alertas</div>
            <div className="stat-value">{alertas.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Activas</div>
            <div className="stat-value">{activas}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Críticas</div>
            <div className="stat-value">{criticas}</div>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Registro de alertas</h2>
          <p>Datos desde <code>public.alertas_climaticas</code></p>
        </div>
        <DialogTrigger label="+ Nueva alerta" dialogId="modal-create-alerta" className="btn btn-agro" />
      </div>

      <div className="table-card">
        {alertas.length === 0 ? (
          <EmptyTable
            emoji="☁️"
            title="Sin alertas registradas"
            message="Publica la primera con «+ Nueva alerta». Se guardan en alertas_climaticas."
          />
        ) : (
          <table className="table table-hover-lite">
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
              {alertas.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.titulo}</strong>
                    <div className="small text-muted table-excerpt">{a.mensaje}</div>
                  </td>
                  <td>
                    <span className={`badge bg-${badgeClass(a.nivel)}`}>
                      {NIVELES[a.nivel] ?? a.nivel}
                    </span>
                  </td>
                  <td className="small">
                    {a.lat != null && a.lng != null
                      ? `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`
                      : "General"}
                  </td>
                  <td>
                    <form action={toggleAlerta}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        className={`btn btn-sm ${a.activo ? "btn-agro" : "btn-outline-secondary"}`}
                      >
                        {a.activo ? "Activa" : "Inactiva"}
                      </button>
                    </form>
                  </td>
                  <td className="small">{String(a.created_at).slice(0, 10)}</td>
                  <td className="text-nowrap">
                    <DialogTrigger
                      label="Editar"
                      dialogId={`edit-alerta-${a.id}`}
                      className="btn btn-sm btn-outline-primary"
                    />
                    <form action={deleteAlerta} className="d-inline" style={{ marginLeft: 4 }}>
                      <input type="hidden" name="id" value={a.id} />
                      <ConfirmDeleteButton />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

      {alertas.map((a) => (
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
