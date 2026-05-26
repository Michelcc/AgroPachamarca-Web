"use client";

import { useState } from "react";
import { normalizeImageUrl } from "@/lib/imageUrl";

export function ProductThumb({
  url,
  alt,
  className = "product-thumb"
}: {
  url: string | null | undefined;
  alt?: string;
  className?: string;
}) {
  const src = normalizeImageUrl(url);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="product-thumb-empty" title={url ? "No se pudo cargar la imagen" : undefined}>📦</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
