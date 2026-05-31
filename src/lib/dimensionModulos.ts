import {
  DIMENSIONES_OPERACIONALIZACION,
  type DimensionOperacional
} from "./operacionalizacion";

export type ModuloDimension = {
  id: string;
  label: string;
  descripcion: string;
  href: string;
  emoji: string;
};

export const MODULOS_POR_DIMENSION: Record<string, ModuloDimension[]> = {
  productividad: [
    {
      id: "productos",
      label: "Productos",
      descripcion: "Catálogo e inventario (rendimiento y calidad)",
      href: "/admin/tablas/productos",
      emoji: "📦"
    }
  ],
  gestion_recursos: [
    {
      id: "productos",
      label: "Productos / insumos",
      descripcion: "Fertilizantes y recursos medidos",
      href: "/admin/tablas/productos",
      emoji: "📦"
    },
    {
      id: "sensores",
      label: "Sensores de suelo",
      descripcion: "Medición IoT: humedad, pH, temperatura",
      href: "/admin/tablas/sensores",
      emoji: "📡"
    }
  ],
  prediccion_agricola: [
    {
      id: "recomendaciones",
      label: "Recomendaciones ML",
      descripcion: "Predicción de cultivos",
      href: "/admin/recomendaciones",
      emoji: "🌾"
    },
    {
      id: "alertas",
      label: "Alertas climáticas",
      descripcion: "Anticipación y riesgos",
      href: "/admin/alertas",
      emoji: "☁️"
    },
    {
      id: "diagnosticos",
      label: "Diagnósticos IA",
      descripcion: "Análisis de planta con visión",
      href: "/admin/diagnosticos",
      emoji: "🔬"
    }
  ],
  toma_decisiones: []
};

export const DIMENSION_SLUGS: Record<string, string> = {
  productividad: "productividad",
  "gestion-recursos": "gestion_recursos",
  "prediccion-agricola": "prediccion_agricola",
  "toma-decisiones": "toma_decisiones"
};

export function slugToDimensionId(slug: string): string | undefined {
  return DIMENSION_SLUGS[slug];
}

export function dimensionIdToSlug(id: string): string | undefined {
  return Object.entries(DIMENSION_SLUGS).find(([, v]) => v === id)?.[0];
}

export function getDimensionById(id: string): DimensionOperacional | undefined {
  return DIMENSIONES_OPERACIONALIZACION.find((d) => d.id === id);
}

export const DIMENSION_NAV = DIMENSIONES_OPERACIONALIZACION.map((d) => ({
  href: `/admin/dimension/${dimensionIdToSlug(d.id) ?? d.id}`,
  label: d.nombre
}));
