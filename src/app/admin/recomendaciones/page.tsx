import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
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
    <AdminShell user={user} title="Recomendaciones de cultivo">
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
        <div className="col-auto ms-auto">
          <DialogTrigger label="+ Nueva" dialogId="modal-create-rec" className="btn btn-agro btn-sm" />
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
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)}>
                <td>{String(r.cultivo)}</td>
                <td>
                  {Number(r.altitud_min_m)} – {Number(r.altitud_max_m)} m
                </td>
                <td>
                  {MESES[Number(r.mes_inicio)] ?? r.mes_inicio} – {MESES[Number(r.mes_fin)] ?? r.mes_fin}
                </td>
                <td>{Number(r.probabilidad)}%</td>
                <td className="small">{String(r.notas ?? "")}</td>
                <td>{r.activo ? "✓" : "—"}</td>
                <td>
                  <DialogTrigger label="Editar" dialogId={`edit-rec-${r.id}`} />
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

      <Dialog id="modal-create-rec" title="Nueva recomendación">
        <form action={createRecomendacion}>
          <div className="modal-body">
            <input className="form-control mb-2" name="cultivo" placeholder="Cultivo" required />
            <div className="row mb-2">
              <div className="col">
                <input className="form-control" name="altitud_min_m" type="number" placeholder="Alt min" defaultValue={0} />
              </div>
              <div className="col">
                <input className="form-control" name="altitud_max_m" type="number" placeholder="Alt max" defaultValue={5000} />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col">
                <input className="form-control" name="mes_inicio" type="number" min={1} max={12} placeholder="Mes inicio" required />
              </div>
              <div className="col">
                <input className="form-control" name="mes_fin" type="number" min={1} max={12} placeholder="Mes fin" required />
              </div>
            </div>
            <input className="form-control mb-2" name="probabilidad" type="number" step="0.01" defaultValue={80} />
            <textarea className="form-control mb-2" name="notas" rows={2} />
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

      {rows.map((r) => (
        <Dialog key={String(r.id)} id={`edit-rec-${r.id}`} title="Editar recomendación">
          <form action={updateRecomendacion}>
            <input type="hidden" name="id" value={String(r.id)} />
            <div className="modal-body">
              <input className="form-control mb-2" name="cultivo" defaultValue={String(r.cultivo)} required />
              <div className="row mb-2">
                <div className="col">
                  <input className="form-control" name="altitud_min_m" type="number" defaultValue={Number(r.altitud_min_m)} />
                </div>
                <div className="col">
                  <input className="form-control" name="altitud_max_m" type="number" defaultValue={Number(r.altitud_max_m)} />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col">
                  <input className="form-control" name="mes_inicio" type="number" defaultValue={Number(r.mes_inicio)} />
                </div>
                <div className="col">
                  <input className="form-control" name="mes_fin" type="number" defaultValue={Number(r.mes_fin)} />
                </div>
              </div>
              <input className="form-control mb-2" name="probabilidad" type="number" defaultValue={Number(r.probabilidad)} />
              <textarea className="form-control mb-2" name="notas" rows={2} defaultValue={String(r.notas ?? "")} />
              <label className="form-check">
                <input type="checkbox" name="activo" defaultChecked={!!r.activo} /> Activo
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
