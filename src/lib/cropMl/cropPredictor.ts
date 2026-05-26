import weights from "./cropModelWeights.json";

type CropMlInput = {
  lat: number;
  lng: number;
  altitud_msnm: number;
  mes: number;
  temp_min_c: number;
  temp_max_c: number;
  precipitacion_mm_semana: number;
};

const model = weights as {
  version: string;
  algorithm: string;
  classes: string[];
  weights: number[][];
  biases: number[];
  metrics?: { accuracyTest: number };
};

function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const ex = logits.map((z) => Math.exp(z - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((v) => v / s);
}

function buildFeatureVector(input: CropMlInput): number[] {
  const { lat, lng, altitud_msnm: alt, mes, temp_min_c, temp_max_c, precipitacion_mm_semana: precip } =
    input;
  const mesSin = Math.sin((2 * Math.PI * mes) / 12);
  const mesCos = Math.cos((2 * Math.PI * mes) / 12);
  const precipNorm = precip / 50;
  const frost = temp_min_c < 2 ? 1 : 0;
  const wet = precip > 25 ? 1 : 0;
  const rainySeason = [10, 11, 12, 1, 2, 3].includes(mes) ? 1 : 0;
  const highZone = alt > 3500 ? 1 : 0;
  return [
    alt / 4500,
    (lat + 12) / 3,
    (lng + 76) / 3,
    mesSin,
    mesCos,
    temp_min_c / 30,
    temp_max_c / 30,
    precipNorm,
    frost,
    wet,
    rainySeason,
    highZone
  ];
}

export function imputeClimateFromAltitude(altitud_msnm: number) {
  const baseTemp = 22 - ((altitud_msnm - 2000) / 1000) * 6.5;
  const temp_max_c = baseTemp + 4;
  const temp_min_c = temp_max_c - 10;
  return { temp_min_c, temp_max_c, precipitacion_mm_semana: 18 };
}

export function predictCropsMl(input: CropMlInput, topK = 3) {
  const x = buildFeatureVector(input);
  const logits = model.weights.map((row, c) =>
    row.reduce((sum, w, j) => sum + w * x[j], 0) + model.biases[c]
  );
  const probs = softmax(logits);
  const ranked = model.classes
    .map((cultivo, indice) => ({ cultivo, probabilidad: probs[indice], indice }))
    .sort((a, b) => b.probabilidad - a.probabilidad)
    .slice(0, topK);

  const acc = model.metrics?.accuracyTest;
  const modelo = `ML ${model.version} (${model.algorithm}${acc != null ? ` · ${(acc * 100).toFixed(0)}% test` : ""})`;

  return {
    modelo,
    top3: ranked.map((t, i) => ({
      rank: i + 1,
      cultivo: t.cultivo,
      probabilidad: Math.round(t.probabilidad * 10000) / 10000
    }))
  };
}
