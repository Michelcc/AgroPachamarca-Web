"use client";

import { useState } from "react";

type TopCultivo = { rank: number; cultivo: string; probabilidad: number };

type PredictResponse = {
  ok: boolean;
  error?: string;
  modelo?: string;
  top3?: TopCultivo[];
  ubicacion?: { lat: number; lng: number; altitud_msnm: number };
  climaUsado?: {
    temp_min_c: number;
    temp_max_c: number;
    precipitacion_mm_semana: number;
    mes: number;
  };
};

export function MlPredictorCard() {
  const [lat, setLat] = useState("-12.55");
  const [lng, setLng] = useState("-75.55");
  const [altitud, setAltitud] = useState("3200");
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPredict(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/recomendaciones/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: Number(lat),
          lng: Number(lng),
          altitud_msnm: Number(altitud),
          mes: Number(mes)
        })
      });
      const json = (await res.json()) as PredictResponse;
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error en la predicción");
        return;
      }
      setResult(json);
    } catch {
      setError("No se pudo conectar con la API de predicción.");
    } finally {
      setLoading(false);
    }
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        if (pos.coords.altitude != null && !Number.isNaN(pos.coords.altitude)) {
          setAltitud(String(Math.round(pos.coords.altitude)));
        }
        setError(null);
        setLoading(false);
      },
      () => {
        setError("No se pudo obtener la ubicación. Permite GPS en el navegador.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="table-card mb-4 p-3">
      <h2 className="h6 text-agro mb-1">Predicción ML (GPS + clima)</h2>
      <p className="small text-muted mb-3">
        Mismo modelo que la app móvil: regresión logística con latitud, longitud, altitud y mes.
      </p>

      <form onSubmit={(e) => void onPredict(e)} className="row g-2 align-items-end">
        <div className="col-md-2 col-6">
          <label className="form-label small">Latitud</label>
          <input
            className="form-control form-control-sm"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label small">Longitud</label>
          <input
            className="form-control form-control-sm"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label small">Altitud (m)</label>
          <input
            className="form-control form-control-sm"
            type="number"
            value={altitud}
            onChange={(e) => setAltitud(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label small">Mes (1-12)</label>
          <input
            className="form-control form-control-sm"
            type="number"
            min={1}
            max={12}
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4 col-12 d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={useGeolocation}>
            Usar mi GPS
          </button>
          <button type="submit" className="btn btn-agro btn-sm" disabled={loading}>
            {loading ? "Calculando…" : "Predecir cultivos"}
          </button>
        </div>
      </form>

      {error ? <p className="text-danger small mt-3 mb-0">{error}</p> : null}

      {result?.ok && result.top3?.length ? (
        <div className="mt-3">
          <p className="small text-muted mb-2">{result.modelo}</p>
          <div className="row g-2">
            {result.top3.map((t) => (
              <div key={t.rank} className="col-md-4">
                <div className="border rounded p-2 bg-white">
                  <strong>
                    #{t.rank} {t.cultivo}
                  </strong>
                  <div className="small text-muted">
                    {(t.probabilidad * 100).toFixed(1)}% compatibilidad
                  </div>
                  <div className="progress mt-1" style={{ height: 6 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${Math.min(100, t.probabilidad * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {result.climaUsado ? (
            <p className="small text-muted mt-2 mb-0">
              Variables: T° {result.climaUsado.temp_min_c.toFixed(1)}–
              {result.climaUsado.temp_max_c.toFixed(1)} °C · Lluvia est.{" "}
              {result.climaUsado.precipitacion_mm_semana.toFixed(1)} mm/sem
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
