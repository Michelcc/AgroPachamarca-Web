import { FormField } from "./FormField";
import { ToggleActive } from "./ToggleActive";

const CULTIVOS = [
  "Papa",
  "Maíz amiláceo",
  "Quinua",
  "Cebada",
  "Haba",
  "Café Arábica",
  "Cacao Fino",
  "Trigo"
];

const MESES = [
  { v: 1, l: "Enero" },
  { v: 2, l: "Febrero" },
  { v: 3, l: "Marzo" },
  { v: 4, l: "Abril" },
  { v: 5, l: "Mayo" },
  { v: 6, l: "Junio" },
  { v: 7, l: "Julio" },
  { v: 8, l: "Agosto" },
  { v: 9, l: "Septiembre" },
  { v: 10, l: "Octubre" },
  { v: 11, l: "Noviembre" },
  { v: 12, l: "Diciembre" }
];

export function RecomendacionFormFields({
  defaultValues
}: {
  defaultValues?: {
    cultivo?: string;
    altitud_min_m?: number;
    altitud_max_m?: number;
    mes_inicio?: number;
    mes_fin?: number;
    probabilidad?: number;
    notas?: string;
    activo?: boolean;
  };
}) {
  const dv = defaultValues ?? {};
  return (
    <>
      <FormField label="Cultivo" hint="Variedad o cultivo recomendado">
        <select className="form-select" name="cultivo" defaultValue={dv.cultivo ?? ""} required>
          <option value="">Seleccionar cultivo…</option>
          {CULTIVOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {dv.cultivo && !CULTIVOS.includes(dv.cultivo) ? (
            <option value={dv.cultivo}>{dv.cultivo}</option>
          ) : null}
        </select>
      </FormField>
      <div className="form-row-2">
        <FormField label="Altitud mín. (m.s.n.m.)">
          <input
            className="form-control"
            name="altitud_min_m"
            type="number"
            defaultValue={dv.altitud_min_m ?? 0}
            placeholder="1200"
          />
        </FormField>
        <FormField label="Altitud máx. (m.s.n.m.)">
          <input
            className="form-control"
            name="altitud_max_m"
            type="number"
            defaultValue={dv.altitud_max_m ?? 5000}
            placeholder="4200"
          />
        </FormField>
      </div>
      <div className="form-row-2">
        <FormField label="Mes inicio siembra">
          <select className="form-select" name="mes_inicio" defaultValue={dv.mes_inicio ?? 1} required>
            {MESES.map((m) => (
              <option key={m.v} value={m.v}>
                {m.l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Mes fin siembra">
          <select className="form-select" name="mes_fin" defaultValue={dv.mes_fin ?? 12} required>
            {MESES.map((m) => (
              <option key={m.v} value={m.v}>
                {m.l}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Probabilidad de éxito (%)" hint="0–100">
        <input
          className="form-control"
          name="probabilidad"
          type="number"
          step="0.01"
          min={0}
          max={100}
          defaultValue={dv.probabilidad ?? 80}
        />
      </FormField>
      <FormField label="Notas técnicas">
        <textarea
          className="form-control"
          name="notas"
          rows={3}
          defaultValue={dv.notas ?? ""}
          placeholder="Ej. Siembra en época seca, variedad adaptada a altura…"
        />
      </FormField>
      <ToggleActive
        title="Recomendación activa"
        description="Aparece en filtros y consultas de la app."
        defaultChecked={dv.activo !== false}
      />
    </>
  );
}
