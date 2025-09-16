import React from 'react';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface RechartsBarDatum {
  label: string;
  value: number;
}

interface RechartsBarProps {
  title: string;
  data: RechartsBarDatum[];
  height?: number;
  color?: string;
  direction?: 'up' | 'down';
  barSize?: number;
}

const RechartsBar: React.FC<RechartsBarProps> = ({ title, data, height = 360, color = '#2563eb', direction = 'up', barSize = 18 }) => {
  const values = data.map(d => Math.abs(Number.isFinite(d.value) ? d.value : 0));
  const maxAbs = Math.max(1, ...values);
  const formatted = data.map(d => ({ label: d.label, value: direction === 'down' ? -(Number(d.value) || 0) : (Number(d.value) || 0) }));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RBarChart data={formatted} margin={{ top: 10, right: 16, left: 0, bottom: 20 }} barCategoryGap={12} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis domain={direction === 'down' ? [-(maxAbs), 0] : [0, 'auto']} tickFormatter={(v) => formatCurrency(Math.abs(v as number))} tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
            <Tooltip formatter={(val: any) => formatCurrency(Math.abs(Number(val)))} labelStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" fill={color} radius={[6,6,0,0]} barSize={barSize} />
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RechartsBar;


