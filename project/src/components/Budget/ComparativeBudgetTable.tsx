import React from 'react';
import { BudgetItem } from '../../types/financial';

interface ComparativeBudgetTableProps {
  currentMonth: BudgetItem[];
  previousMonth1: BudgetItem[];
  previousMonth2: BudgetItem[];
  monthNames: string[];
}

const ComparativeBudgetTable: React.FC<ComparativeBudgetTableProps> = ({
  currentMonth,
  previousMonth1,
  previousMonth2,
  monthNames
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const getVariance = (actual: number, forecast: number) => {
    if (forecast === 0) return 0;
    return ((actual - forecast) / forecast) * 100;
  };

  const getVarianceColor = (variance: number, type: string) => {
    if (type === 'revenue' || type === 'balance') {
      return variance >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return variance <= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const getRowStyle = (type: string, level: number) => {
    if (level === 0) {
      switch (type) {
        case 'balance':
          return 'bg-blue-50 border-l-4 border-blue-500 font-bold';
        case 'revenue':
          return 'bg-green-50 border-l-4 border-green-500 font-semibold';
        case 'expense':
          return 'bg-red-50 border-l-4 border-red-500 font-semibold';
        default:
          return 'bg-gray-50 font-semibold';
      }
    }
    return 'hover:bg-gray-50';
  };

  const renderTableRow = (item: BudgetItem, index: number) => {
    const variance = getVariance(item.actual, item.forecast);
    const rowStyle = getRowStyle(item.type, item.level || 0);

    return (
      <tr key={item.id} className={`border-b border-gray-200 ${rowStyle}`}>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div>
              <div className="font-medium text-gray-900">{item.category}</div>
              {item.code !== '=' && (
                <div className="text-sm text-gray-500">{item.code}</div>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 text-right">
          <span className="font-medium">{formatCurrency(item.actual)}</span>
        </td>
        
        <td className="px-6 py-4 text-right">
          <span className="font-medium">{formatCurrency(item.forecast)}</span>
        </td>
        
        <td className="px-6 py-4 text-right">
          <span className={`font-medium ${getVarianceColor(variance, item.type)}`}>
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
          </span>
        </td>
        
        <td className="px-6 py-4 text-right text-sm text-gray-600">
          {((item.actual / currentMonth.find(i => i.type === 'revenue')?.actual || 1) * 100).toFixed(1)}%
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conta
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Real
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Forecast
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Variação
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              % Receita
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentMonth.map((item, index) => renderTableRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativeBudgetTable;