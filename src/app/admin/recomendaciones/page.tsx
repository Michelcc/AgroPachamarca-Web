import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { RecomendacionFormFields } from "@/components/forms/RecomendacionForm";
import { MlPredictorCard } from "@/components/MlPredictorCard";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createRecomendacion, updateRecomendacion, deleteRecomendacion } from "./actions";

const MESES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function filterRows(
  rows: Record<string, unknown>[],
  altitud: number | null,
  mes: number | null
) {
  let out = rows;
  if (altitud !== null) {
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
  searchParams: Promise<{ altitud?: string; mes?: string }>;
}) {
  const user = await getAdminPageUser();
  const sp = await searchParams;
  const filtroAlt = sp.altitud ? Number(sp.altitud) : null;
  const filtroMes = sp.mes ? Number(sp.mes) : null;

  const { data: all } = await getSupabaseAdmin()
    .from("recomendaciones_cultivo")
    .select("*")
    .order("cultivo")
    .order("altitud_min_m");

  const rows = filterRows(all ?? [], filtroAlt, filtroMes);

  return (
    <AdminShell
      user={user}
      title="Recomendaciones de cultivo"
      subtitle="Optimiza decisiones con ML, altitud y estacionalidad."
    >
      <MlPredictorCard />

      <div className="page-toolbar">
        <div>
          <h2>Matriz de recomendaciones</h2>
          <p>{rows.length} reglas activas en base de datos</p>
        </div>
        <DialogTrigger label="+ Nueva recomendación" dialogId="modal-create-rec" className="btn btn-agro" />
      </div>

      <form method="get" className="row g-2 mb-3 align-items-end">
        <div className="col-auto">
          <label className="form-label small">Altitud (msnm)</label>
          <input
            type="number"
            name="altitud"
            className="form-control form-control-sm"
            defaultValue={filtroAlt ?? ""}
            placeholder="Ej. 3200"
          />
        </div>
        <div className="col-auto">
          <label className="form-label small">Mes (1-12)</label>
          <input
            type="number"
            name="mes"
            className="form-control form-control-sm"
            min={1}
            max={12}
            defaultValue={filtroMes ?? ""}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-agro btn-sm">Filtrar</button>{" "}
          <Link href="/admin/recomendaciones" className="btn btn-outline-secondary btn-sm">
            Limpiar
          </Link>
        </div>
      </form>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Cultivo</th>
              <th>Altitud</th>
              <th>Meses</th>
              <th>Prob.</th>
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
                <td>
                  {Number(r.altitud_min_m)} – {Number(r.altitud_max_m)} m
                </td>
                <td>
                  {MESES[Number(r.mes_inicio)] ?? r.mes_inicio} – {MESES[Number(r.mes_fin)] ?? r.mes_fin}
                </td>
                <td>
                  <span className="badge bg-success">{Number(r.probabilidad)}%</span>
                </td>
                <td className="small">{String(r.notas ?? "—")}</td>
                <td>{r.activo ? <span className="badge bg-success">Activo</span> : "—"}</td>
                <td>
                  <DialogTrigger label="Editar" dialogId={`edit-rec-${r.id}`} className="btn btn-sm btn-outline-primary" />
                  <form action={deleteRecomendacion} className="d-inline" style={{ marginLeft: 4 }}>
                    <input type="hidden" name="id" value={String(r.id)} />
                    <ConfirmDeleteButton />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
