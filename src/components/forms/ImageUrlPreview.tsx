"use client";

import { useEffect, useState } from "react";
import { normalizeImageUrl } from "@/lib/imageUrl";
import { FormField } from "./FormField";

export function ImageUrlPreview({
  name = "imagen_url",
  defaultValue = "",
  label = "URL de imagen"
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [imgError, setImgError] = useState(false);
  const normalized = normalizeImageUrl(url);
  const valid = !!normalized && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [url]);

  return (
    <FormField label={label} className="form-field-full">
      <input
        className="form-control"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://tu-proyecto.supabase.co/storage/v1/object/public/productos/foto.jpg"
      />
      <p className="form-hint">
        Debe ser una URL pública con <strong>https://</strong>. Sube el archivo en Supabase → Storage
        (bucket <code>productos</code>) o usa un enlace directo a .jpg / .png / .webp. Ver{" "}
        <code>sql/storage-productos.sql</code>.
      </p>
      <div className={`image-preview-box${valid ? " image-preview-box--filled" : ""}`}>
        {valid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalized!}
            alt="Vista previa"
            onError={() => setImgError(true)}
            className="image-preview-img"
          />
        ) : (
          <div className="image-preview-placeholder">
            <span className="image-preview-icon" aria-hidden>
              🖼
            </span>
            <strong>Vista previa de imagen</strong>
            <span>Pega una URL arriba para visualizar</span>
          </div>
        )}
      </div>
    </FormField>
  );
}
