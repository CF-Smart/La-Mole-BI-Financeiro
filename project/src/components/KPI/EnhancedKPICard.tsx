import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, DollarSign, Package, Briefcase, AlertTriangle, Scale } from 'lucide-react';
import { KPICard as KPICardType } from '../../types/financial';

interface EnhancedKPICardProps {
  data: KPICardType;
}

const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({ data }) => {
  const { title, forecast, actual, previousMonth, type, marginPercentage, expectedMargin } = data;
  
  const variance = forecast !== 0 ? ((actual - forecast) / forecast) * 100 : 0;
  const monthlyChange = previousMonth !== 0 ? ((actual - previousMonth) / previousMonth) * 100 : 0;
  
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
        return Package;
      case 'Despesas Operacionais':
        return Briefcase;
      case 'Despesas Não Operacionais':
        return AlertTriangle;
      case 'Saldo Final':
      case 'Saldo Antes da Distribuição de Lucros':
      case 'Saldo Final Líquido (Caixa)':
        return Scale;
      default:
        return DollarSign;
    }
  };

  const getGradientStyle = () => {
    switch (type) {
      case 'revenue':
        return 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200';
      case 'expense':
        return 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-red-200';
      case 'balance':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-blue-200';
      default:
        return 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-gray-200';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'revenue':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'balance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const KPIIcon = getKPIIcon();
  const VarianceIcon = getVarianceIcon();

  return (
    <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border ${getGradientStyle()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-1.5 rounded-md bg-white/60 backdrop-blur-sm ${getIconColor()} mr-2 shadow-sm`}>
            <KPIIcon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-gray-800 font-semibold text-xs leading-tight" title={title}>
              {title}
            </h3>
          </div>
        </div>
        
        <div className={`flex items-center ${getVarianceColor()}`}>
          <VarianceIcon className="h-3 w-3 mr-1" aria-hidden="true" />
          <span className="text-[10px] font-semibold" aria-label={`Variação: ${variance > 0 ? 'positiva' : 'negativa'} ${Math.abs(variance).toFixed(1)} por cento`}>
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-xl font-bold text-gray-900 mb-1 whitespace-nowrap" aria-label={`Valor atual: ${formatCurrency(actual)}`}>
          {formatCurrency(actual)}
        </p>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-600 whitespace-nowrap">
            Meta: <span className="whitespace-nowrap inline-block">{formatCurrency(forecast)}</span>
          </span>
          <div className={`font-medium flex items-center ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyChange >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" aria-hidden="true" />
            )}
            <span aria-label={`Variação mensal: ${monthlyChange > 0 ? 'positiva' : 'negativa'} ${Math.abs(monthlyChange).toFixed(1)} por cento`}>
              {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-gray-600 mb-1">
          <span>Progresso</span>
          <span aria-label={`Progresso: ${Math.min(100, (actual / forecast) * 100).toFixed(0)} por cento`}>
            {Math.min(100, (actual / forecast) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-1.5 backdrop-blur-sm">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              type === 'revenue' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : type === 'balance' && title === 'Margem Líquida'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600'
                : type === 'balance'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
            style={{ width: `${Math.min(100, (actual / forecast) * 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.min(100, (actual / forecast) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso da meta: ${Math.min(100, (actual / forecast) * 100).toFixed(0)}%`}
          />
        </div>
        
        {/* Special margin comparison for Margem Líquida */}
        {title === 'Margem Líquida' && marginPercentage !== undefined && expectedMargin !== undefined && (
          <div className="mt-2 pt-2 border-t border-purple-200">
            <div className="flex justify-between text-[10px] text-gray-600 mb-1">
              <span>Margem vs Meta</span>
              <span className={marginPercentage >= expectedMargin ? 'text-green-600' : 'text-red-600'}>
                {marginPercentage >= expectedMargin ? '+' : ''}{(marginPercentage - expectedMargin).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  marginPercentage >= expectedMargin 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                }`}
                style={{ width: `${Math.min(100, (marginPercentage / expectedMargin) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedKPICard;