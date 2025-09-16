import React from 'react';
import { ChartData } from '../../types/financial';

interface BarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
  legendLabels?: { current?: string; previous?: string; forecast?: string };
  showSeries?: { current?: boolean; previous?: boolean; forecast?: boolean };
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300, legendLabels, showSeries }) => {
  const labels = {
    current: legendLabels?.current ?? 'Atual',
    previous: legendLabels?.previous ?? 'Bimestre Anterior',
    forecast: legendLabels?.forecast ?? 'Previsão',
  };
  const show = {
    current: showSeries?.current !== false,
    previous: showSeries?.previous !== false,
    forecast: showSeries?.forecast !== false,
  };
  const pickValues = (d: ChartData) => [
    show.current ? (d.current ?? 0) : 0,
    show.previous ? (d.previous ?? 0) : 0,
    show.forecast ? (d.forecast ?? 0) : 0,
  ];
  const allValues = data.flatMap(d => pickValues(d));
  const absValues = allValues.map(v => Math.abs(Number.isFinite(v) ? (v as number) : 0));
  const nonZero = absValues.filter(v => v > 0);
  let maxValue = Math.max(1, ...absValues);
  if (nonZero.length >= 2) {
    const sorted = [...nonZero].sort((a, b) => a - b);
    const top = sorted[sorted.length - 1];
    const second = sorted[sorted.length - 2];
    // If the top value is a strong outlier, scale by the second largest to reveal other bars
    if (top > second * 4) {
      maxValue = Math.max(1, second);
    }
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const barHeight = (value: number) => {
    const v = Math.max(0, Math.abs(Number(value) || 0));
    const ratio = maxValue > 0 ? (v / maxValue) : 0;
    let pct = Math.max(0, Math.min(1, ratio)) * 100;
    const minPct = 30; // piso visual moderado para barras > 0
    if (v > 0 && pct < minPct) pct = minPct;
    return `${pct}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="flex items-end justify-between" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex items-end space-x-3 h-full w-full">
              {show.current && (
                <div className="rounded-t-md group relative h-full w-8 flex-none">
                  <div
                    className="w-full bg-blue-600 rounded-t-md transition-all duration-300 hover:bg-blue-700"
                    style={{ height: barHeight(item.current), minHeight: (item.current ?? 0) !== 0 ? '8px' : '0' }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(item.current)}
                  </div>
                </div>
              )}
              {show.previous && (
                <div className="rounded-t-md group relative h-full w-8 flex-none">
                  <div
                    className="w-full bg-gray-400 rounded-t-md transition-all duration-300 hover:bg-gray-500"
                    style={{ height: barHeight(item.previous), minHeight: (item.previous ?? 0) !== 0 ? '8px' : '0' }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(item.previous)}
                  </div>
                </div>
              )}
              {show.forecast && (
                <div className="rounded-t-md group relative h-full w-8 flex-none">
                  <div
                    className="w-full bg-green-500 rounded-t-md transition-all duration-300 hover:bg-green-600"
                    style={{ height: barHeight(item.forecast), minHeight: (item.forecast ?? 0) !== 0 ? '8px' : '0' }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(item.forecast)}
                  </div>
                </div>
              )}
            </div>
            
            <span className="text-xs text-gray-600 font-medium">{item.month}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6 space-x-6">
        {show.current && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-xs text-gray-600">{labels.current}</span>
          </div>
        )}
        {show.previous && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
            <span className="text-xs text-gray-600">{labels.previous}</span>
          </div>
        )}
        {show.forecast && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">{labels.forecast}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChart;