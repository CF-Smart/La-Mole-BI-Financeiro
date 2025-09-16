import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
  color?: string; // hex color e.g. '#2563eb'
}

const AreaChart: React.FC<AreaChartProps> = ({ title, data, height = 360, color = '#2563eb' }) => {
  const values = data.map(d => Math.abs(Number.isFinite(d.value) ? d.value : 0));
  const maxValue = Math.max(1, ...values);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map(p => p * maxValue);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  // Build SVG polyline and area polygon
  const n = Math.max(1, data.length);
  const points = data.map((d, i) => {
    const x = ((i + 0.5) / n) * 100; // center of each slot
    const ratio = Math.max(0, Math.min(1, (Math.abs(Number(d.value) || 0) / maxValue)));
    const y = 100 - (ratio * 100);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="flex" style={{ height }}>
        {/* Y Axis */}
        <div className="w-20 pr-2 flex flex-col justify-between items-end text-[10px] text-gray-500 select-none">
          {ticks.map((t, i) => (
            <span key={i}>{formatCurrency(t)}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="relative flex-1">
          {/* Gridlines */}
          {ticks.map((t, i) => (
            <div key={`grid-${i}`} className="absolute left-0 right-0 border-t border-dashed border-gray-200" style={{ bottom: `${(t / maxValue) * 100}%` }} />
          ))}

          {/* SVG */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#areaFill)" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="3" />
          </svg>

          {/* X Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            {data.map((d, i) => (
              <span key={i} className="text-xs text-gray-600 font-medium" style={{ transform: 'translateX(-50%)', position: 'absolute', left: `${((i + 0.5) / n) * 100}%` }}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: color }}></div>
          <span className="text-xs text-gray-600">Atual</span>
        </div>
      </div>
    </div>
  );
};

export default AreaChart;



