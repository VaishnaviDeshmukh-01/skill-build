import { useEffect, useState } from "react";

export function ReadinessRing({
  value,
  size = 168,
  label = "Estimated Career Readiness",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const [display, setDisplay] = useState(0);
  const stroke = size / 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setDisplay(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className="inline-flex flex-col items-center gap-2"
      role="img"
      aria-label={`${label}: ${value} percent`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * display) / 100}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold tabular-nums">{value}%</span>
        </div>
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
