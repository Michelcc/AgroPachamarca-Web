import { FormField } from "./FormField";
import { ToggleActive } from "./ToggleActive";

const NIVELES = [
  { value: "info", label: "Informativo", desc: "Aviso general sin urgencia" },
  { value: "advertencia", label: "Moderado", desc: "Requiere atención del productor" },
  { value: "critico", label: "Crítico", desc: "Riesgo inmediato para cultivos" }
];

export function AlertaFormFields({
  defaultValues
}: {
  defaultValues?: {
    titulo?: string;
    mensaje?: string;
    nivel?: string;
    lat?: number | null;
    lng?: number | null;
    ubicacion_texto?: string;
    activo?: boolean;
  };
}) {
  const dv = defaultValues ?? {};
  return (
    <>
      <FormField label="Título de alerta" hint="Ej. Riesgo de Helada Temprana">
        <input
          className="form-control"
          name="titulo"
          defaultValue={dv.titulo ?? ""}
          placeholder="Título visible en la app"
          required
        />
      </FormField>
      <FormField label="Mensaje detallado">
        <textarea
          className="form-control"
          name="mensaje"
          rows={4}
          defaultValue={dv.mensaje ?? ""}
          placeholder="Descripción para agricultores y técnicos de campo…"
          required
        />
      </FormField>
      <FormField label="Nivel de riesgo">
        <select className="form-select" name="nivel" defaultValue={dv.nivel ?? "info"}>
          {NIVELES.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label} — {n.desc}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Ubicación (referencia)" hint="Texto libre o coordenadas GPS">
        <input
          className="form-control mb-2"
          name="ubicacion_texto"
          defaultValue={dv.ubicacion_texto ?? ""}
          placeholder="Ej. Zona Norte - Sector B4"
        />
        <div className="form-row-2">
          <input
            className="form-control"
            name="lat"
            type="number"
            step="any"
            defaultValue={dv.lat ?? ""}
            placeholder="Latitud"
          />
          <input
            className="form-control"
            name="lng"
            type="number"
            step="any"
            defaultValue={dv.lng ?? ""}
            placeholder="Longitud"
          />
        </div>
      </FormField>
      <ToggleActive
        title="Alerta activa"
        description="Visible para usuarios de la app móvil."
        defaultChecked={dv.activo !== false}
      />
    </>
  );
}
