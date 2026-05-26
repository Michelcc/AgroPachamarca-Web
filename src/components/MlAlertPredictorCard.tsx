"use client";

import { useState } from "react";

type PredictResult = {
  ok: boolean;
  error?: string;
  modelo?: string;
  escenario?: string;
  probabilidad?: number;
  nivel?: string;
  alertas?: Array<{ mensaje: string; tipo: string }>;
};

export function MlAlertPredictorCard() {
  const [lat, setLat] = useState("-12.55");
  const [lng, setLng] = useState("-75.55");
  const [altitud, setAltitud] = useState("3200");
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [tmin, setTmin] = useState("6");
  const [tmax, setTmax] = useState("18");
  const [prob, setProb] = useState("0.45");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPredict(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/alertas/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: Number(lat),
          lng: Number(lng),
          altitud_msnm: Number(altitud),
          mes: Number(mes),
          temp_min_c: Number(tmin),
          temp_max_c: Number(tmax),
          prob_precipitacion: Number(prob)
        })
      });
      const json = (await res.json()) as PredictResult;
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error en predicción");
        return;
      }
      setResult(json);
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      setError("Geolocalización no disponible.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        if (pos.coords.altitude != null) setAltitud(String(Math.round(pos.coords.altitude)));
      },
      () => setError("Permite GPS en el navegador.")
    );
  }

  const nivelClass =
    result?.nivel === "critico" || result?.nivel === "alto"
      ? "danger"
      : result?.nivel === "medio"
        ? "warning"
        : "info";

  return (
    <div className="table-card mb-4 p-3">
      <h2 className="h6 text-agro mb-1">Evaluación de alertas con ML</h2>
      <p className="small text-muted mb-3">
        Clasifica riesgo climático (normal, lluvia, helada, crítico) con GPS y pronóstico.
      </p>

      <form onSubmit={(e) => void onPredict(e)} className="row g-2 align-items-end">
        <div className="col-md-2 col-6">
          <label className="form-label small">Lat</label>
          <input className="form-control form-control-sm" value={lat} onChange={(e) => setLat(e.target.value)} />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label small">Lng</label>
          <input className="form-control form-control-sm" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label small">Altitud</label>
          <input className="form-control form-control-sm" value={altitud} onChange={(e) => setAltitud(e.target.value)} />
        </div>
        <div className="col-md-1 col-6">
          <label className="form-label small">Mes</label>
          <input className="form-control form-control-sm" value={mes} onChange={(e) => setMes(e.target.value)} />
        </div>
        <div className="col-md-1 col-6">
          <label className="form-label small">T° min</label>
          <input className="form-control form-control-sm" value={tmin} onChange={(e) => setTmin(e.target.value)} />
        </div>
        <div className="col-md-1 col-6">
          <label className="form-label small">T° máx</label>
          <input className="form-control form-control-sm" value={tmax} onChange={(e) => setTmax(e.target.value)} />
        </div>
        <div className="col-md-1 col-6">
          <label className="form-label small">Prob. lluvia</label>
          <input
            className="form-control form-control-sm"
            step="0.01"
            min={0}
            max={1}
            value={prob}
            onChange={(e) => setProb(e.target.value)}
          />
        </div>
        <div className="col-md-2 col-12 d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={useGeolocation}>
            GPS
          </button>
          <button type="submit" className="btn btn-agro btn-sm" disabled={loading}>
            {loading ? "…" : "Evaluar ML"}
          </button>
        </div>
      </form>

      {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}

      {result?.ok ? (
        <div className="mt-3">
          <span className={`badge bg-${nivelClass} me-2`}>Nivel: {result.nivel}</span>
          <span className="badge bg-secondary me-2">{result.escenario}</span>
          <span className="small text-muted">
            {((result.probabilidad ?? 0) * 100).toFixed(1)}% · {result.modelo}
          </span>
          <ul className="small mt-2 mb-0">
            {(result.alertas ?? []).map((a, i) => (
              <li key={i}>{a.mensaje}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
