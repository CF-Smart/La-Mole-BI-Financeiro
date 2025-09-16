import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
  colorClass?: string; // tailwind bg-* color class
  barWidthPx?: number; // largura fixa por barra
  minBarPercent?: number; // piso visual de altura (%) quando valor>0
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data, height = 300, colorClass = 'bg-blue-600', barWidthPx = 8, minBarPercent = 30 }) => {
  const values = data.map(d => Math.abs(Number.isFinite(d.value) ? d.value : 0));
  const nonZero = values.filter(v => v > 0);
  let maxValue = Math.max(1, ...values);
  if (nonZero.length >= 2) {
    const sorted = [...nonZero].sort((a, b) => a - b);
    const top = sorted[sorted.length - 1];
    const second = sorted[sorted.length - 2];
    if (top > second * 4) maxValue = Math.max(1, second);
  }
  const ticks = [1, 0.75, 0.5, 0.25, 0].map(p => p * maxValue);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const barHeight = (value: number) => {
    const v = Math.max(0, Math.abs(Number(value) || 0));
    const ratio = maxValue > 0 ? (v / maxValue) : 0;
    let pct = Math.max(0, Math.min(1, ratio)) * 100;
    const minPct = Math.max(0, Math.min(100, minBarPercent));
    if (v > 0 && pct < minPct) pct = minPct;
    return `${pct}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="flex" style={{ height }}>
        {/* Y Axis */}
        <div className="w-16 pr-2 flex flex-col justify-between items-end text-[10px] text-gray-500 select-none">
          {ticks.map((t, i) => (
            <span key={i}>{formatCurrency(t)}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="relative flex-1">
          {/* Gridlines */}
          {ticks.map((t, i) => (
            <div
              key={`grid-${i}`}
              className="absolute left-0 right-0 border-t border-dashed border-gray-200"
              style={{ bottom: `${(t / maxValue) * 100}%` }}
            />
          ))}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex items-end h-full w-full justify-center">
                  <div className={`rounded-t-md group relative h-full flex-none ${colorClass}`} style={{ backgroundColor: 'transparent', width: `${barWidthPx}px` }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${colorClass}`}
                      style={{ height: barHeight(item.value), minHeight: (item.value ?? 0) !== 0 ? '8px' : '0' }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded mr-2 ${colorClass}`}></div>
          <span className="text-xs text-gray-600">Atual</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleBarChart;


