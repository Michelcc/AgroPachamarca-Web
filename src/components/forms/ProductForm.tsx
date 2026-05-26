"use client";

import { FormField } from "./FormField";
import { ImageUrlPreview } from "./ImageUrlPreview";
const CATEGORIAS = [
  "Fertilizantes",
  "Semillas",
  "Protección",
  "Bioinsumo",
  "Herramientas",
  "Otros"
];

const UNIDADES = ["kg", "L", "unidad", "saco", "litro"];

export type ProfileOption = { id: string; nombre?: string | null; username?: string | null };

export function ProductFormFields({
  profiles,
  defaultValues,
  showUserSelect = true
}: {
  profiles: ProfileOption[];
  showUserSelect?: boolean;
  defaultValues?: {
    user_id?: string;
    nombre?: string;
    categoria?: string;
    precio?: number;
    unidad?: string;
    stock?: number;
    imagen_url?: string | null;
    disponible?: boolean;
    destacado?: boolean;
  };
}) {
  const dv = defaultValues ?? {};
  return (
    <div className="form-grid form-grid-product">
      <div className="form-grid-col">
        {showUserSelect ? (
          <FormField label="Usuario app (propietario)">
            <select className="form-select" name="user_id" defaultValue={dv.user_id ?? ""} required>
              <option value="">Seleccionar usuario…</option>
              {profiles.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.nombre ?? pr.username}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}
        <FormField label="Product Name">
          <input
            className="form-control"
            name="nombre"
            defaultValue={dv.nombre ?? ""}
            placeholder="Ej. Fertilizante Orgánico NPK"
            required
          />
        </FormField>
        <FormField label="Category">
          <select className="form-select" name="categoria" defaultValue={dv.categoria ?? ""} required>
            <option value="">Seleccionar categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {dv.categoria && !CATEGORIAS.includes(dv.categoria) ? (
              <option value={dv.categoria}>{dv.categoria}</option>
            ) : null}
          </select>
        </FormField>
        <div className="form-row-2">
          <FormField label="Price (S/)">
            <input
              className="form-control"
              name="precio"
              type="number"
              step="0.01"
              min={0}
              defaultValue={dv.precio ?? 0}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Unit">
            <select className="form-select" name="unidad" defaultValue={dv.unidad ?? "kg"}>
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u === "kg" ? "Kilogramos (kg)" : u === "L" ? "Litros (L)" : u}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Stock Quantity">
          <input
            className="form-control"
            name="stock"
            type="number"
            step="0.01"
            min={0}
            defaultValue={dv.stock ?? 0}
            placeholder="Ej. 500"
          />
        </FormField>
        <div className="form-checks-row">
          <label className="form-check-pill">
            <input type="checkbox" name="disponible" defaultChecked={dv.disponible !== false} />
            Available for sale
          </label>
          <label className="form-check-pill">
            <input type="checkbox" name="destacado" defaultChecked={!!dv.destacado} />
            Featured Product
          </label>
        </div>
      </div>
      <div className="form-grid-col">
        <ImageUrlPreview defaultValue={dv.imagen_url ?? ""} label="Image URL" />
      </div>
    </div>
  );
}
