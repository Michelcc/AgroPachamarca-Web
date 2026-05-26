import weights from "./alertModelWeights.json";

type AlertMlInput = {
  lat: number;
  lng: number;
  altitud_msnm: number;
  mes: number;
  temp_min_c: number;
  temp_max_c: number;
  prob_precipitacion: number;
};

const model = weights as {
  version: string;
  algorithm: string;
  classes: string[];
  weights: number[][];
  biases: number[];
  metrics?: { accuracyTest: number };
};

const MENSAJES: Record<string, { mensaje: string; tipo: string }> = {
  normal: { mensaje: "Condiciones normales.", tipo: "ok" },
  lluvia: { mensaje: "Alta probabilidad de lluvia.", tipo: "lluvia" },
  lluvia_fuerte: { mensaje: "Lluvia muy probable.", tipo: "lluvia_fuerte" },
  helada: { mensaje: "Riesgo de helada ligera.", tipo: "helada" },
  critico: {
    mensaje: "Riesgo crítico: helada y lluvia intensa.",
    tipo: "critico"
  }
};

function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const ex = logits.map((z) => Math.exp(z - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((v) => v / s);
}

function buildFeatures(input: AlertMlInput): number[] {
  const { lat, lng, altitud_msnm: alt, mes, temp_min_c, temp_max_c, prob_precipitacion: p } =
    input;
  return [
    (lat + 12) / 3,
    (lng + 76) / 3,
    alt / 4500,
    temp_min_c / 30,
    temp_max_c / 30,
    p,
    (temp_max_c - temp_min_c) / 25,
    Math.sin((2 * Math.PI * mes) / 12),
    Math.cos((2 * Math.PI * mes) / 12),
    temp_min_c < 2 ? 1 : 0,
    p >= 0.85 ? 1 : 0,
    alt > 3500 ? 1 : 0
  ];
}

function nivelFromEscenario(e: string): string {
  if (e === "normal") return "bajo";
  if (e === "lluvia") return "medio";
  if (e === "critico") return "critico";
  return "alto";
}

export function predictAlertasMl(input: AlertMlInput) {
  const x = buildFeatures(input);
  const logits = model.weights.map((row, c) =>
    row.reduce((sum, w, j) => sum + w * x[j], 0) + model.biases[c]
  );
  const probs = softmax(logits);
  let best = 0;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[best]) best = i;
  }
  const escenario = model.classes[best];
  const acc = model.metrics?.accuracyTest;
  const modelo = `ML ${model.version} (${model.algorithm}${acc != null ? ` · ${(acc * 100).toFixed(0)}% test` : ""})`;

  return {
    modelo,
    escenario,
    probabilidad: Math.round(probs[best] * 10000) / 10000,
    nivel: nivelFromEscenario(escenario),
    alertas: [MENSAJES[escenario] ?? MENSAJES.normal]
  };
}
