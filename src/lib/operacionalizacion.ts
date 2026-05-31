/** Misma matriz que src/schema/operacionalizacion.ts (app móvil) */
export const VARIABLE_DEPENDIENTE = "Cultivos agrícolas" as const;

export type TipoInstrumento =
  | "ficha_observacion"
  | "registro"
  | "observacion"
  | "medicion"
  | "analisis"
  | "prueba"
  | "comparacion"
  | "encuesta";

export type IndicadorOperacional = {
  id: string;
  nombre: string;
  instrumento: string;
  tipoInstrumento: TipoInstrumento;
  unidad?: string;
  fuenteApp?: string;
};

export type DimensionOperacional = {
  id: string;
  nombre: string;
  indicadores: IndicadorOperacional[];
};

export const DIMENSIONES_OPERACIONALIZACION: DimensionOperacional[] = [
  {
    id: "productividad",
    nombre: "Productividad",
    indicadores: [
      {
        id: "rendimiento_cultivos",
        nombre: "Rendimiento de cultivos",
        instrumento: "Ficha de observación",
        tipoInstrumento: "ficha_observacion",
        unidad: "kg/ha",
        fuenteApp: "Registro manual en parcela"
      },
      {
        id: "incremento_produccion",
        nombre: "Incremento de producción",
        instrumento: "Registro",
        tipoInstrumento: "registro",
        unidad: "%",
        fuenteApp: "Comparación vs. línea base"
      },
      {
        id: "calidad_cultivo",
        nombre: "Calidad del cultivo",
        instrumento: "Observación",
        tipoInstrumento: "observacion",
        unidad: "escala 1-5",
        fuenteApp: "Evaluación visual en campo"
      }
    ]
  },
  {
    id: "gestion_recursos",
    nombre: "Gestión de recursos",
    indicadores: [
      {
        id: "uso_eficiente_agua",
        nombre: "Uso eficiente del agua",
        instrumento: "Medición",
        tipoInstrumento: "medicion",
        unidad: "% humedad suelo",
        fuenteApp: "Sensores IoT · pestaña Suelo"
      },
      {
        id: "uso_fertilizantes",
        nombre: "Uso de fertilizantes",
        instrumento: "Medición",
        tipoInstrumento: "medicion",
        unidad: "kg o unidades",
        fuenteApp: "Productos / insumos registrados"
      },
      {
        id: "optimizacion_insumos",
        nombre: "Optimización de insumos",
        instrumento: "Análisis",
        tipoInstrumento: "analisis",
        unidad: "% optimización",
        fuenteApp: "Análisis de consumo vs. recomendación"
      }
    ]
  },
  {
    id: "prediccion_agricola",
    nombre: "Predicción agrícola",
    indicadores: [
      {
        id: "precision_prediccion",
        nombre: "Precisión de predicción",
        instrumento: "Prueba",
        tipoInstrumento: "prueba",
        unidad: "%",
        fuenteApp: "ML cultivos · pestaña Cultivo"
      },
      {
        id: "anticipacion_climatica",
        nombre: "Anticipación climática",
        instrumento: "Registro",
        tipoInstrumento: "registro",
        unidad: "días anticipación",
        fuenteApp: "Clima y alertas"
      },
      {
        id: "reduccion_riesgos",
        nombre: "Reducción de riesgos",
        instrumento: "Comparación",
        tipoInstrumento: "comparacion",
        unidad: "% reducción",
        fuenteApp: "Alertas ML vs. histórico"
      }
    ]
  },
  {
    id: "toma_decisiones",
    nombre: "Toma de decisiones",
    indicadores: [
      {
        id: "rapidez_decision",
        nombre: "Rapidez de decisión",
        instrumento: "Encuesta",
        tipoInstrumento: "encuesta",
        unidad: "escala 1-5",
        fuenteApp: "Autoevaluación productor"
      },
      {
        id: "precision_decisiones",
        nombre: "Precisión en decisiones",
        instrumento: "Encuesta",
        tipoInstrumento: "encuesta",
        unidad: "escala 1-5",
        fuenteApp: "Autoevaluación productor"
      },
      {
        id: "confianza_decisiones",
        nombre: "Confianza en decisiones",
        instrumento: "Encuesta",
        tipoInstrumento: "encuesta",
        unidad: "escala 1-5",
        fuenteApp: "Autoevaluación productor"
      }
    ]
  }
];

export const TOTAL_INDICADORES = DIMENSIONES_OPERACIONALIZACION.reduce(
  (n, d) => n + d.indicadores.length,
  0
);

export function findIndicador(id: string) {
  for (const dimension of DIMENSIONES_OPERACIONALIZACION) {
    const indicador = dimension.indicadores.find((i) => i.id === id);
    if (indicador) return { dimension, indicador };
  }
  return null;
}
