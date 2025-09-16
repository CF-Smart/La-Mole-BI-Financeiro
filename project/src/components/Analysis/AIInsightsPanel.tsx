import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, Activity } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface AIInsightsPanelProps {
  selectedPeriod: { start: number; end: number };
  title: string;
  subtitle: string;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ selectedPeriod, title, subtitle }) => {
  // Portuguese month names
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Get raw import data
  const rawData = dataService.getRawImportData();

  // Parse currency values correctly
  const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value) return 0;
    
    const stringValue = String(value).trim();
    const isNegative = stringValue.includes('-');
    
    const cleanValue = stringValue
      .replace(/[^\d.,-]/g, '')
      .replace(/\.(?=.*\.)/g, '')
      .replace(',', '.');
    
    let parsed = parseFloat(cleanValue);
    if (isNaN(parsed)) parsed = 0;
    
    if (isNegative && parsed > 0) {
      parsed = -parsed;
    }
    
    return parsed;
  };

  // Generate AI insights based on actual data
  const generateInsights = () => {
    if (!rawData || rawData.length < 3) {
      return {
        trends: [],
        variances: [],
        spikes: [],
        margins: [],
        cashDrivers: []
      };
    }

    const insights = {
      trends: [] as any[],
      variances: [] as any[],
      spikes: [] as any[],
      margins: [] as any[],
      cashDrivers: [] as any[]
    };

    // Analyze month-over-month trends
    for (let i = 2; i < Math.min(rawData.length, 10); i++) { // Analyze first 8 categories
      const row = rawData[i] as any[];
      if (!row[0]) continue;
      
      const categoryName = String(row[0]).trim();
      const monthlyActuals: number[] = [];
      
      // Get actual values for the selected period
      for (let monthIndex = selectedPeriod.start; monthIndex <= selectedPeriod.end; monthIndex++) {
        const actualColIndex = 2 + (monthIndex * 2);
        const actualValue = parseCurrency(row[actualColIndex]);
        monthlyActuals.push(actualValue);
      }
      
      if (monthlyActuals.length >= 2) {
        const firstMonth = monthlyActuals[0];
        const lastMonth = monthlyActuals[monthlyActuals.length - 1];
        
        if (firstMonth !== 0) {
          const change = ((lastMonth - firstMonth) / Math.abs(firstMonth)) * 100;
          
          if (Math.abs(change) > 15) { // Significant change threshold
            insights.trends.push({
              category: categoryName,
              change: change,
              direction: change > 0 ? 'up' : 'down',
              magnitude: Math.abs(change)
            });
          }
        }
      }
      
      // Analyze variances vs forecast
      const currentMonthIndex = selectedPeriod.end;
      const forecastColIndex = 1 + (currentMonthIndex * 2);
      const actualColIndex = 2 + (currentMonthIndex * 2);
      
      const forecast = parseCurrency(row[forecastColIndex]);
      const actual = parseCurrency(row[actualColIndex]);
      
      if (forecast !== 0) {
        const variance = ((actual - forecast) / Math.abs(forecast)) * 100;
        
        if (Math.abs(variance) > 20) { // Significant variance threshold
          insights.variances.push({
            category: categoryName,
            variance: variance,
            forecast: forecast,
            actual: actual,
            impact: Math.abs(actual - forecast)
          });
        }
      }
    }

    // Sort insights by magnitude
    insights.trends.sort((a, b) => b.magnitude - a.magnitude);
    insights.variances.sort((a, b) => b.impact - a.impact);

    // Generate cash drivers (top inflows/outflows)
    const currentMonthIndex = selectedPeriod.end;
    for (let i = 2; i < Math.min(rawData.length, 15); i++) {
      const row = rawData[i] as any[];
      if (!row[0]) continue;
      
      const categoryName = String(row[0]).trim();
      const actualColIndex = 2 + (currentMonthIndex * 2);
      const actual = parseCurrency(row[actualColIndex]);
      
      if (Math.abs(actual) > 10000) { // Significant cash movement threshold
        insights.cashDrivers.push({
          category: categoryName,
          amount: actual,
          type: actual > 0 ? 'inflow' : 'outflow'
        });
      }
    }

    insights.cashDrivers.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    return insights;
  };

  const insights = generateInsights();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Month-over-Month Trends */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Tendências Mensais
            </h3>
            {insights.trends.length > 0 ? (
              <div className="space-y-3">
                {insights.trends.slice(0, 3).map((trend, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{trend.category}</span>
                      <div className={`flex items-center ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-semibold">{formatPercentage(trend.change)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma tendência significativa detectada.</p>
            )}
          </div>

          {/* Largest Variances */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              Maiores Variações vs Forecast
            </h3>
            {insights.variances.length > 0 ? (
              <div className="space-y-3">
                {insights.variances.slice(0, 3).map((variance, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{variance.category}</span>
                      <span className={`text-sm font-semibold ${variance.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(variance.variance)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Real: {formatCurrency(variance.actual)} | Previsto: {formatCurrency(variance.forecast)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma variação significativa detectada.</p>
            )}
          </div>

          {/* Cash Drivers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              Principais Movimentações
            </h3>
            {insights.cashDrivers.length > 0 ? (
              <div className="space-y-3">
                {insights.cashDrivers.slice(0, 4).map((driver, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{driver.category}</span>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          driver.type === 'inflow' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {driver.type === 'inflow' ? 'Entrada' : 'Saída'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Math.abs(driver.amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma movimentação significativa detectada.</p>
            )}
          </div>

          {/* Summary Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              Resumo Executivo
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>Período analisado:</strong> {monthNames[selectedPeriod.start]} a {monthNames[selectedPeriod.end]}
                </p>
              </div>
              
              {insights.trends.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tendência principal:</strong> {insights.trends[0].category} apresentou {insights.trends[0].direction === 'up' ? 'crescimento' : 'redução'} de {formatPercentage(Math.abs(insights.trends[0].change))}.
                  </p>
                </div>
              )}
              
              {insights.variances.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Maior desvio:</strong> {insights.variances[0].category} com variação de {formatPercentage(insights.variances[0].variance)} vs forecast.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;