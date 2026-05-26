import { FormField } from "./FormField";
import { ToggleActive } from "./ToggleActive";

const CATEGORIAS = [
  "Terreno",
  "Clima",
  "Cultivo",
  "Sanidad",
  "Comercial",
  "Cooperativa",
  "Finanzas",
  "Calidad ISO",
  "IA y sensores",
  "Capacitación",
  "Trazabilidad",
  "Sistema",
  "Inventario",
  "Climatología",
  "Operaciones"
];

export function TablaFormFields({
  isEdit = false,
  defaultValues
}: {
  isEdit?: boolean;
  defaultValues?: {
    codigo?: string;
    categoria?: string;
    nombre_display?: string;
    icono?: string;
    orden?: number;
    activo?: boolean;
  };
}) {
  const dv = defaultValues ?? {};
  return (
    <>
      <div className="form-row-2">
        <FormField label="Código de Tabla" hint="p. ej. AGRO_001">
          <input
            className="form-control"
            name="codigo"
            defaultValue={dv.codigo ?? ""}
            placeholder="p. ej. AGRO_001"
            required
            readOnly={isEdit}
          />
        </FormField>
        <FormField label="Categoría">
          <select className="form-select" name="categoria" defaultValue={dv.categoria ?? ""} required>
            <option value="">Seleccionar…</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Nombre de Visualización">
        <input
          className="form-control"
          name="nombre_display"
          defaultValue={dv.nombre_display ?? ""}
          placeholder="Ingrese el nombre público de la tabla"
          required
        />
      </FormField>
      <div className="form-row-2">
        <FormField label="Icono">
          <input
            className="form-control"
            name="icono"
            defaultValue={dv.icono ?? "📋"}
            placeholder="📋"
          />
        </FormField>
        <FormField label="Orden">
          <input
            className="form-control"
            name="orden"
            type="number"
            defaultValue={dv.orden ?? 0}
          />
        </FormField>
      </div>
      <ToggleActive
        title="Estado Activo"
        description="Permite que la tabla sea visible en los reportes y la app."
        defaultChecked={dv.activo !== false}
      />
    </>
  );
}
