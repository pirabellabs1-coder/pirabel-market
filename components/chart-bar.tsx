/**
 * Dead-simple SVG bar chart — zero deps.
 * Renders a single row of equal-width bars. Good for "last N days" views.
 */
export function ChartBar({
  data,
  height = 80,
  label,
  format = (n: number) => n.toString(),
}: {
  data: { label: string; value: number }[];
  height?: number;
  label?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map(d => d.value));
  const padding = 8;
  const barWidth = 100 / data.length;

  return (
    <div>
      {label && <div className="caps mute" style={{ fontSize: 10, marginBottom: 8 }}>{label}</div>}
      <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - padding * 2);
          return (
            <g key={i}>
              <rect
                x={i * barWidth + barWidth * 0.15}
                y={height - padding - h}
                width={barWidth * 0.7}
                height={h}
                fill="#14110d"
                opacity={d.value > 0 ? 0.85 : 0.2}
                rx="0.5"
              />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', fontSize: 9, color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '.04em' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div>{d.label}</div>
            <div style={{ color: 'var(--ink)', fontWeight: 500, fontSize: 10 }}>{format(d.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
