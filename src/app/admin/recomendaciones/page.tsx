import Link from "next/link";
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
import { MlPredictorCard } from "@/components/MlPredictorCard";
import { PageFlash } from "@/components/PageFlash";
import { ProbGauge } from "@/components/ProbGauge";
import { RecomendacionFormFields } from "@/components/forms/RecomendacionForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { fetchRecomendaciones } from "@/lib/admin-queries";
import { createRecomendacion, updateRecomendacion, deleteRecomendacion } from "./actions";

const MESES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function filterRows(
  rows: Record<string, unknown>[],
  altitud: number | null,
  mes: number | null
) {
  if (altitud === null && mes === null) return rows;
  let out = rows;
  if (altitud !== null && !Number.isNaN(altitud)) {
    out = out.filter(
      (r) => altitud >= Number(r.altitud_min_m) && altitud <= Number(r.altitud_max_m)
    );
  }
  if (mes !== null && mes >= 1 && mes <= 12) {
    out = out.filter((r) => {
      const ini = Number(r.mes_inicio);
      const fin = Number(r.mes_fin);
      if (ini <= fin) return mes >= ini && mes <= fin;
      return mes >= ini || mes <= fin;
    });
  }
  return out;
}

export default async function RecomendacionesPage({
  searchParams
}: {
  searchParams: Promise<{ altitud?: string; mes?: string; ok?: string; error?: string }>;
}) {
  const user = await getAdminPageUser();
  const sp = await searchParams;
  const filtroAlt = sp.altitud ? Number(sp.altitud) : null;
  const filtroMes = sp.mes ? Number(sp.mes) : null;

  const { data: all, error: errRec } = await fetchRecomendaciones();
  const rows = filterRows(all as Record<string, unknown>[], filtroAlt, filtroMes);
  const filtrando = filtroAlt !== null || filtroMes !== null;

  const activas = all.filter((r) => r.activo).length;
  const probProm =
    all.length > 0
      ? all.reduce((s, r) => s + Number(r.probabilidad), 0) / all.length
      : 0;

  return (
    <AdminShell
      user={user}
      title="Recomendaciones de cultivo"
      subtitle="Tabla recomendaciones_cultivo — reglas y ML."
    >
      <PageFlash ok={sp.ok} error={sp.error} />

      {errRec ? (
        <div className="alert alert-danger">
          Error al cargar: {errRec}. Ejecuta <code>web-admin/sql/schema.sql</code>.
        </div>
      ) : null}

      <MlPredictorCard />

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Total en BD</div>
            <div className="stat-value">{all.length}</div>
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
            <div className="stat-label">Probabilidad media</div>
            <ProbGauge value={probProm} size="lg" />
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Matriz de recomendaciones</h2>
          <p>
            {filtrando
              ? `Mostrando ${rows.length} de ${all.length} (filtro activo)`
              : `${all.length} registros en recomendaciones_cultivo`}
          </p>
        </div>
        <DialogTrigger label="+ Nueva recomendación" dialogId="modal-create-rec" className="btn btn-agro" />
      </div>

      <form method="get" className="filter-bar">
        <div className="filter-bar-field">
          <label>Altitud (msnm)</label>
          <input
            type="number"
            name="altitud"
            className="form-control form-control-sm"
            defaultValue={filtroAlt ?? ""}
            placeholder="Ej. 3200"
          />
        </div>
        <div className="filter-bar-field">
          <label>Mes (1-12)</label>
          <input
            type="number"
            name="mes"
            className="form-control form-control-sm"
            min={1}
            max={12}
            defaultValue={filtroMes ?? ""}
            placeholder="Opcional"
          />
        </div>
        <button type="submit" className="btn btn-agro btn-sm">
          Filtrar
        </button>
        {filtrando ? (
          <Link href="/admin/recomendaciones" className="btn btn-outline-secondary btn-sm">
            Ver todas ({all.length})
          </Link>
        ) : null}
      </form>

      <div className="table-card">
        {rows.length === 0 ? (
          <EmptyTable
            emoji="🌾"
            title={filtrando ? "Ninguna coincide con el filtro" : "Sin recomendaciones"}
            message={
              filtrando
                ? "Prueba «Ver todas» o ajusta altitud/mes."
                : "Crea una con «+ Nueva recomendación»."
            }
          />
        ) : (
          <table className="table table-hover-lite">
            <thead>
              <tr>
                <th>Cultivo</th>
                <th>Altitud</th>
                <th>Meses</th>
                <th>Probabilidad</th>
                <th>Notas</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)}>
                  <td>
                    <strong>{String(r.cultivo)}</strong>
                  </td>
                  <td className="small">
                    {Number(r.altitud_min_m)} – {Number(r.altitud_max_m)} m
                  </td>
                  <td className="small">
                    {MESES[Number(r.mes_inicio)] ?? r.mes_inicio} –{" "}
                    {MESES[Number(r.mes_fin)] ?? r.mes_fin}
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <ProbGauge value={Number(r.probabilidad)} />
                  </td>
                  <td className="small table-excerpt">{String(r.notas ?? "—")}</td>
                  <td>
                    {r.activo ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-secondary">Inactivo</span>
                    )}
                  </td>
                  <td className="text-nowrap">
                    <DialogTrigger
                      label="Editar"
                      dialogId={`edit-rec-${r.id}`}
                      className="btn btn-sm btn-outline-primary"
                    />
                    <form action={deleteRecomendacion} className="d-inline" style={{ marginLeft: 4 }}>
                      <input type="hidden" name="id" value={String(r.id)} />
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
        id="modal-create-rec"
        title="Nueva recomendación"
        subtitle="Genera guías técnicas basadas en altitud, mes de siembra y probabilidad de éxito."
      >
        <form action={createRecomendacion}>
          <ModalBody>
            <RecomendacionFormFields />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-rec" submitLabel="Crear recomendación" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      {rows.map((r) => (
        <EnterpriseDialog
          key={String(r.id)}
          id={`edit-rec-${r.id}`}
          title="Editar recomendación"
          subtitle={String(r.cultivo)}
        >
          <form action={updateRecomendacion}>
            <input type="hidden" name="id" value={String(r.id)} />
            <ModalBody>
              <RecomendacionFormFields
                defaultValues={{
                  cultivo: String(r.cultivo),
                  altitud_min_m: Number(r.altitud_min_m),
                  altitud_max_m: Number(r.altitud_max_m),
                  mes_inicio: Number(r.mes_inicio),
                  mes_fin: Number(r.mes_fin),
                  probabilidad: Number(r.probabilidad),
                  notas: String(r.notas ?? ""),
                  activo: !!r.activo
                }}
              />
            </ModalBody>
            <ModalFooter>
              <ModalActions dialogId={`edit-rec-${r.id}`} submitLabel="Guardar cambios" />
            </ModalFooter>
          </form>
        </EnterpriseDialog>
      ))}
    </AdminShell>
  );
}
