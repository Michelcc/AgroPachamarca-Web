"use client";

import { useEffect, useState } from "react";
import { FormField } from "./FormField";

export function ImageUrlPreview({
  name = "imagen_url",
  defaultValue = "",
  label = "Image URL"
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [imgError, setImgError] = useState(false);
  const valid = url.trim().length > 0 && !imgError;

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
        placeholder="https://ejemplo.com/imagen.jpg"
      />
      <div className={`image-preview-box${valid ? " image-preview-box--filled" : ""}`}>
        {valid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
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
