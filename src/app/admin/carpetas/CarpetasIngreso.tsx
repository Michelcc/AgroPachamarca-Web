"use client";

import { useState, useTransition } from "react";
import { getDespachos, ingresoCarpeta } from "./actions";

type Fiscalia = { id: string; nombre: string };

export function CarpetasIngreso({ fiscalias }: { fiscalias: Fiscalia[] }) {
  const [despachos, setDespachos] = useState<{ id: string; nombre: string }[]>([]);
  const [pending, startTransition] = useTransition();

  async function onFiscaliaChange(fid: string) {
    if (!fid) {
      setDespachos([]);
      return;
    }
    const list = await getDespachos(fid);
    setDespachos(list);
  }

  return (
    <div className="table-card">
      <h2 className="h6 fw-bold mb-3">Ingreso de carpeta</h2>
      <form
        action={(fd) => startTransition(() => ingresoCarpeta(fd))}
        className="row g-3"
      >
        <div className="col-md-3">
          <label className="form-label">Número</label>
          <input className="form-control" name="numero" required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Imputado</label>
          <input className="form-control" name="imputado" required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Agraviado</label>
          <input className="form-control" name="agraviado" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Delito</label>
          <input className="form-control" name="delito" required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Fiscalía</label>
          <select
            className="form-select"
            name="fiscalia_id"
            onChange={(e) => onFiscaliaChange(e.target.value)}
          >
            <option value="">—</option>
            {fiscalias.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Despacho</label>
          <select className="form-select" name="despacho_id">
            <option value="">—</option>
            {despachos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Fiscal responsable</label>
          <input className="form-control" name="fiscal_responsable" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Folios</label>
          <input className="form-control" name="folios" type="number" defaultValue={0} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Correo</label>
          <input className="form-control" name="correo" type="email" />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-agro" disabled={pending}>
            {pending ? "Guardando…" : "Registrar carpeta"}
          </button>
        </div>
      </form>
    </div>
  );
}
