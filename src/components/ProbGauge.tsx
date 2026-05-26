export function ProbGauge({
  value,
  size = "md"
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const level = pct >= 80 ? "high" : pct >= 55 ? "mid" : "low";

  return (
    <div className={`prob-gauge prob-gauge--${size} prob-gauge--${level}`} title={`${pct}%`}>
      <div className="prob-gauge-track">
        <div className="prob-gauge-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="prob-gauge-label">{pct.toFixed(0)}%</span>
    </div>
  );
}
