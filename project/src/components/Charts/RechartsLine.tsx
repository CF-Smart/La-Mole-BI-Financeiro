import React from 'react';
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface RechartsLineDatum {
  label: string;
  current?: number;
  previous?: number;
}

interface RechartsLineProps {
  title: string;
  data: RechartsLineDatum[];
  height?: number;
  colors?: { current?: string; previous?: string };
}

const RechartsLine: React.FC<RechartsLineProps> = ({ title, data, height = 360, colors }) => {
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RLineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v))} tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
            <Tooltip formatter={(val: any) => formatCurrency(Number(val))} labelStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="current" name="Ano Atual" stroke={colors?.current || '#2563eb'} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="previous" name="2024" stroke={colors?.previous || '#7c3aed'} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RechartsLine;



