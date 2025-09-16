import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Wallet, PiggyBank, Calculator } from 'lucide-react';
import { KPICard as KPICardType } from '../../types/financial';

interface CompactKPICardProps {
  data: KPICardType;
}

const CompactKPICard: React.FC<CompactKPICardProps> = ({ data }) => {
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

  const getKPIIcon = () => {
    switch (title) {
      case 'Saldo Inicial':
        return PiggyBank;
      case 'Receita Total':
        return DollarSign;
      case 'CPV/CMV/CSP':
        return ShoppingCart;
      case 'Despesas Operacionais':
        return CreditCard;
      case 'Despesas Não Operacionais':
        return Calculator;
      case 'Saldo Final':
        return Wallet;
      default:
        return DollarSign;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'revenue':
        return 'text-green-600 bg-green-100';
      case 'expense':
        return 'text-red-600 bg-red-100';
      case 'balance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const KPIIcon = getKPIIcon();
  const VarianceIcon = getVarianceIcon();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getIconColor()} mr-3`}>
            <KPIIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-gray-800 font-semibold text-sm">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(actual)}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center ${getVarianceColor()}`}>
          <VarianceIcon className="h-4 w-4 mr-1" />
          <span className="text-sm font-semibold">
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-600">
        <div>
          <span>Prev: {formatCurrency(forecast)}</span>
        </div>
        <div className={`font-medium ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}% vs mês ant.
        </div>
      </div>
      
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
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

export default CompactKPICard;