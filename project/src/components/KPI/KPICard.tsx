import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KPICard as KPICardType } from '../../types/financial';

interface KPICardProps {
  data: KPICardType;
}

const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const { title, forecast, actual, previousMonth, type } = data;
  
  const variance = ((actual - forecast) / forecast) * 100;
  const monthlyChange = ((actual - previousMonth) / previousMonth) * 100;
  
  const getVarianceColor = () => {
    if (type === 'revenue' || type === 'balance') {
      return variance >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return variance <= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const getVarianceIcon = () => {
    if (type === 'revenue' || type === 'balance') {
      return variance >= 0 ? TrendingUp : TrendingDown;
    } else {
      return variance <= 0 ? TrendingUp : TrendingDown;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const VarianceIcon = getVarianceIcon();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div className={`flex items-center ${getVarianceColor()}`}>
          <VarianceIcon className="h-4 w-4 mr-1" />
          <span className="text-sm font-semibold">
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(actual)}
          </p>
          <p className="text-xs text-gray-500">Real</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">{formatCurrency(forecast)}</p>
            <p className="text-xs text-gray-500">Previsto</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">vs Mês Anterior</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 rounded-lg p-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progresso</span>
          <span>{Math.min(100, (actual / forecast) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              type === 'revenue' || type === 'balance'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            style={{ width: `${Math.min(100, (actual / forecast) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default KPICard;