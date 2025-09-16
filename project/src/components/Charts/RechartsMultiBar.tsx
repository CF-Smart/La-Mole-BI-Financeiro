import React from 'react';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface MultiBarDatum {
  label: string;
  current?: number;
  previous?: number;
  forecast?: number;
}

interface RechartsMultiBarProps {
  title: string;
  data: MultiBarDatum[];
  height?: number;
  show?: { current?: boolean; previous?: boolean; forecast?: boolean };
  direction?: 'up' | 'down';
  barSize?: number;
  labels?: { current?: string; previous?: string; forecast?: string };
  colors?: { current?: string; previous?: string; forecast?: string };
}

const RechartsMultiBar: React.FC<RechartsMultiBarProps> = ({ title, data, height = 360, show, direction = 'up', barSize = 14, labels, colors }) => {
  const flags = {
    current: show?.current !== false,
    previous: show?.previous !== false,
    forecast: show?.forecast === true, // off by default
  };

  const formatted = data.map(d => ({
    label: d.label,
    current: Number.isFinite(d.current) ? (direction === 'down' ? -(d.current as number) : (d.current as number)) : 0,
    previous: Number.isFinite(d.previous) ? (direction === 'down' ? -(d.previous as number) : (d.previous as number)) : 0,
    forecast: Number.isFinite(d.forecast) ? (direction === 'down' ? -(d.forecast as number) : (d.forecast as number)) : 0,
  }));

  const values = formatted.flatMap(d => [Math.abs(d.current || 0), Math.abs(d.previous || 0), Math.abs(d.forecast || 0)]);
  const maxAbs = Math.max(1, ...values);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RBarChart data={formatted} margin={{ top: 10, right: 16, left: 0, bottom: 20 }} barCategoryGap={10} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis domain={direction === 'down' ? [-(maxAbs), 0] : [0, 'auto']} tickFormatter={(v) => formatCurrency(Math.abs(v as number))} tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
            <Tooltip formatter={(val: any) => formatCurrency(Math.abs(Number(val)))} labelStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {flags.current && <Bar dataKey="current" name={labels?.current || 'Atual'} fill={colors?.current || '#2563eb'} radius={[6,6,0,0]} barSize={barSize} />}
            {flags.previous && <Bar dataKey="previous" name={labels?.previous || 'Anterior/Acum'} fill={colors?.previous || '#9ca3af'} radius={[6,6,0,0]} barSize={barSize} />}
            {flags.forecast && <Bar dataKey="forecast" name={labels?.forecast || 'Previsto'} fill={colors?.forecast || '#10b981'} radius={[6,6,0,0]} barSize={barSize} />}
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RechartsMultiBar;


