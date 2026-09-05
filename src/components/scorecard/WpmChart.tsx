import React from 'react';
import { WpmSample } from '../../types/typing';

interface WpmChartProps {
  samples: WpmSample[];
  height?: number;
}

export const WpmChart: React.FC<WpmChartProps> = ({ samples, height = 110 }) => {
  if (!samples || samples.length < 2) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface-secondary)',
          borderColor: 'var(--border-app)',
          color: 'var(--text-muted)',
          height,
        }}
        className="w-full flex items-center justify-center text-xs font-mono italic rounded-2xl border-2"
      >
        Dynamic typing curve generated after test
      </div>
    );
  }

  const maxWpm = Math.max(...samples.map((s) => s.wpm), 40);
  const minWpm = Math.max(0, Math.min(...samples.map((s) => s.wpm)) - 10);
  const range = Math.max(maxWpm - minWpm, 10);

  const width = 500;
  const padding = 16;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const points = samples.map((sample, idx) => {
    const x = padding + (idx / (samples.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((sample.wpm - minWpm) / range) * graphHeight;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const areaPathData = `${pathData} L ${padding + graphWidth},${padding + graphHeight} L ${padding},${padding + graphHeight} Z`;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderColor: 'var(--border-app)',
      }}
      className="w-full rounded-2xl p-2.5 border-2"
    >
      <div className="flex items-center justify-between text-[10px] font-mono mb-1 select-none">
        <span style={{ color: 'var(--text-secondary)' }}>WPM TIMELINE</span>
        <span style={{ color: 'var(--color-brand)' }} className="font-bold">
          PEAK: {maxWpm} WPM
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Mid gridline */}
        <line
          x1={padding}
          y1={padding + graphHeight / 2}
          x2={padding + graphWidth}
          y2={padding + graphHeight / 2}
          stroke="var(--border-strong)"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        {/* Area fill */}
        <path d={areaPathData} fill="url(#wpmGradient)" />

        {/* Line curve */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak dots */}
        {samples.map((s, idx) => {
          if (idx === 0 || idx === samples.length - 1 || s.wpm === maxWpm) {
            const cx = padding + (idx / (samples.length - 1)) * graphWidth;
            const cy = padding + graphHeight - ((s.wpm - minWpm) / range) * graphHeight;
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3"
                className="fill-white stroke-2"
                style={{ stroke: 'var(--color-brand)' }}
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};
