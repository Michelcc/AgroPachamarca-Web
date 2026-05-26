import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { predictAlertasMl } from "@/lib/alertMl/alertPredictor";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const body = await readJsonBody<{
    lat?: number;
    lng?: number;
    altitud?: number;
    altitud_msnm?: number;
    mes?: number;
    temp_min_c?: number;
    temp_max_c?: number;
    prob_precipitacion?: number;
  }>(request);

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return json({ ok: false, error: "lat y lng son obligatorios" }, 400);
  }

  const altitud_msnm = Number(body.altitud_msnm ?? body.altitud ?? 3200);
  const mes = Number(body.mes ?? new Date().getMonth() + 1);
  const temp_min_c = Number(body.temp_min_c ?? 8);
  const temp_max_c = Number(body.temp_max_c ?? temp_min_c + 12);
  const prob_precipitacion = Number(body.prob_precipitacion ?? 0.3);

  const result = predictAlertasMl({
    lat,
    lng,
    altitud_msnm,
    mes,
    temp_min_c,
    temp_max_c,
    prob_precipitacion
  });

  return json({
    ok: true,
    ...result,
    ubicacion: { lat, lng, altitud_msnm },
    climaUsado: { temp_min_c, temp_max_c, prob_precipitacion, mes }
  });
}

export async function GET() {
  return methodNotAllowed();
}
