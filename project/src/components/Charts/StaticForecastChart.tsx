import React from 'react';
import { dataService } from '../../services/dataService';

interface StaticForecastChartProps {
  title: string;
  height?: number;
}

const StaticForecastChart: React.FC<StaticForecastChartProps> = ({ title, height = 400 }) => {
  // Get current month index (0-11, where 0 = January)
  const currentMonthIndex = new Date().getMonth();
  
  // Portuguese month names matching import structure
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Get raw imported data
  const rawData = dataService.getRawImportData();
  
  if (!rawData || rawData.length < 5) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center text-gray-500" style={{ height }}>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p>Dados de forecast não disponíveis</p>
            <p className="text-sm mt-2">Importe dados para visualizar a projeção</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to find row by exact category name match
  const findRowByExactCategory = (searchTerm: string): any[] | null => {
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      const categoryName = String(row[0] || '').trim();
      if (categoryName === searchTerm) {
        return row;
      }
    }
    return null;
  };

  // Helper function to parse currency values with robust cleaning - PRESERVE NEGATIVE SIGNS
  const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value) return 0;
    
    // Convert to string and preserve negative sign
    const stringValue = String(value).trim();
    const isNegative = stringValue.includes('-');
    
    // Clean value: remove currency symbols, spaces, letters but keep digits, dots, commas
    const cleanValue = stringValue
      .replace(/[^\d.,-]/g, '') // Keep only digits, dots, commas, and minus
      .replace(/\.(?=.*\.)/g, '') // Remove thousand separator dots (keep only the last dot)
      .replace(',', '.'); // Convert decimal comma to dot
    
    let parsed = parseFloat(cleanValue);
    if (isNaN(parsed)) parsed = 0;
    
    // Apply negative sign if detected
    if (isNegative && parsed > 0) {
      parsed = -parsed;
    }
    
    return parsed;
  };

  // Get data for chart (current month through December)
  const chartData = [];
  let allValues: number[] = [];

  // Find source rows by exact labels
  const saldoFinalRow = findRowByExactCategory('Saldo Final de Caixa');
  const totalRecebimentosRow = findRowByExactCategory('Total de Recebimentos');
  const totalPagamentosRow = findRowByExactCategory('Total de Pagamentos');

  // Log what we found for debugging
  console.log('Chart Data Sources:', {
    saldoFinalFound: !!saldoFinalRow,
    recebimentosFound: !!totalRecebimentosRow,
    pagamentosFound: !!totalPagamentosRow,
    currentMonth: monthNames[currentMonthIndex]
  });

  for (let monthIndex = currentMonthIndex; monthIndex < 12; monthIndex++) {
    const monthName = monthNames[monthIndex];
    const forecastColIndex = 1 + (monthIndex * 2); // B, D, F, H, J, L, N, P, R, T, V, X (Previsto columns)

    // Get Saldo Final de Caixa - Previsto
    let saldoFinal = 0;
    if (saldoFinalRow && saldoFinalRow[forecastColIndex] !== undefined) {
      saldoFinal = parseCurrency(saldoFinalRow[forecastColIndex]);
    }

    // Get Total de Recebimentos - Previsto
    let receita = 0;
    if (totalRecebimentosRow && totalRecebimentosRow[forecastColIndex] !== undefined) {
      receita = parseCurrency(totalRecebimentosRow[forecastColIndex]);
    }

    // Get Total de Pagamentos - Previsto
    let pagamentos = 0;
    if (totalPagamentosRow && totalPagamentosRow[forecastColIndex] !== undefined) {
      pagamentos = parseCurrency(totalPagamentosRow[forecastColIndex]);
    }

    chartData.push({
      month: monthName,
      receita,
      pagamentos,
      saldoFinal
    });

    // Collect all values for domain calculation
    allValues.push(receita, pagamentos, saldoFinal);
  }

  // Calculate Y-axis domain to accommodate all positive and negative values
  const minValue = Math.min(...allValues, 0); // Ensure zero is included
  const maxValue = Math.max(...allValues, 0); // Ensure zero is included
  const padding = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 0.1; // 10% padding
  const yMin = minValue - padding;
  const yMax = maxValue + padding;
  const yRange = yMax - yMin;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  // Helper function to convert value to Y position (0% = top, 100% = bottom)
  const getYPosition = (value: number): number => {
    if (yRange === 0) return 50; // Center if no range
    return ((yMax - value) / yRange) * 100;
  };

  // Helper function to get bar position and height from zero baseline
  const getBarFromZero = (value: number): { top: number; height: number } => {
    const zeroY = getYPosition(0);
    const valueY = getYPosition(value);
    
    if (value >= 0) {
      // Positive values: bar goes from zero up
      return {
        top: valueY,
        height: Math.max(zeroY - valueY, 0)
      };
    } else {
      // Negative values: bar goes from zero down
      return {
        top: zeroY,
        height: Math.max(valueY - zeroY, 0)
      };
    }
  };

  // Check if we have any data to display
  const hasData = chartData.some(d => d.receita !== 0 || d.pagamentos !== 0 || d.saldoFinal !== 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center text-gray-500" style={{ height }}>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p>Dados não encontrados para as categorias:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• "Saldo Final de Caixa"</li>
              <li>• "Total de Recebimentos"</li>
              <li>• "Total de Pagamentos"</li>
            </ul>
            <p className="text-xs mt-3 text-gray-400">
              Verifique se os rótulos na Coluna A correspondem exatamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">
        Projeção de {monthNames[currentMonthIndex]} até Dezembro (valores previstos)
      </p>
      
      <div className="relative w-full" style={{ height }}>
        {/* Zero reference line */}
        <div 
          className="absolute w-full border-t-2 border-gray-300 border-dashed opacity-50"
          style={{ top: `${getYPosition(0)}%` }}
        />
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-20 w-16 text-right">
          <span>{formatCurrency(yMax)}</span>
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(yMin)}</span>
        </div>

        {/* Chart content area */}
        <div className="ml-20 h-full relative">
          {/* Mixed Chart Container */}
          <div className="relative w-full h-full">
            {/* SVG for Line with Gradient Fill */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              style={{ zIndex: 5 }}
            >
              <defs>
                {/* Gradient definition for line fill */}
                <linearGradient id="saldoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
                
                {/* Glow filter for line */}
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Gradient fill area under the line */}
              {chartData.length > 1 && (
                <path
                  d={`
                    M 0,${getYPosition(chartData[0].saldoFinal)}%
                    ${chartData.map((item, index) => {
                      const x = ((index + 0.5) / chartData.length) * 100;
                      const y = getYPosition(item.saldoFinal);
                      return `L ${x}%,${y}%`;
                    }).join(' ')}
                    L 100%,${getYPosition(0)}%
                    L 0,${getYPosition(0)}%
                    Z
                  `}
                  fill="url(#saldoGradient)"
                  opacity="0.6"
                />
              )}
              
              {/* Saldo Final Line */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  filter="url(#lineGlow)"
                  points={chartData.map((item, index) => {
                    const x = ((index + 0.5) / chartData.length) * 100;
                    const y = getYPosition(item.saldoFinal);
                    return `${x}%,${y}%`;
                  }).join(' ')}
                  className="drop-shadow-lg"
                />
              )}
              
              {/* Saldo Points */}
              {chartData.map((item, index) => {
                const x = ((index + 0.5) / chartData.length) * 100;
                const y = getYPosition(item.saldoFinal);
                return (
                  <g key={index}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                      filter="url(#lineGlow)"
                      className="cursor-pointer"
                    />
                    <text
                      x={`${x}%`}
                      y={`${y - 8}%`}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-green-700"
                      style={{ textShadow: '0 0 3px white' }}
                    >
                      {formatCurrency(item.saldoFinal)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bars Container */}
            <div className="absolute inset-0 flex justify-between items-end" style={{ zIndex: 3 }}>
              {chartData.map((item, index) => {
                const receitaBar = getBarFromZero(item.receita);
                const pagamentosBar = getBarFromZero(item.pagamentos);
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 max-w-20 relative h-full">
                    {/* Bars positioned absolutely within this container */}
                    <div className="relative w-full h-full">
                      {/* Receita Bar (Blue) */}
                      {item.receita !== 0 && (
                        <div className="absolute left-1 group" style={{ zIndex: 2 }}>
                          <div
                            className="w-6 bg-blue-600 transition-all duration-300 hover:bg-blue-700 rounded-sm"
                            style={{ 
                              position: 'absolute',
                              top: `${receitaBar.top}%`,
                              height: `${Math.max(receitaBar.height, 0.5)}%`,
                              minHeight: item.receita !== 0 ? '2px' : '0px'
                            }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                            Receita: {formatCurrency(item.receita)}
                          </div>
                        </div>
                      )}
                      
                      {/* Pagamentos Bar (Red) */}
                      {item.pagamentos !== 0 && (
                        <div className="absolute right-1 group" style={{ zIndex: 2 }}>
                          <div
                            className="w-6 bg-red-500 transition-all duration-300 hover:bg-red-600 rounded-sm"
                            style={{ 
                              position: 'absolute',
                              top: `${pagamentosBar.top}%`,
                              height: `${Math.max(pagamentosBar.height, 0.5)}%`,
                              minHeight: item.pagamentos !== 0 ? '2px' : '0px'
                            }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                            Pagamentos: {formatCurrency(item.pagamentos)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Month label */}
                    <span className="text-xs text-gray-600 font-medium mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Receita Prevista</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Pagamentos Previstos</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Saldo Final Previsto</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-gray-600">Receita Total</div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.receita, 0))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Pagamentos Totais</div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.pagamentos, 0))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Saldo Final</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(chartData[chartData.length - 1]?.saldoFinal || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-400">
        Y-axis: {formatCurrency(yMin)} to {formatCurrency(yMax)} | 
        Sample: R{chartData[0]?.receita || 0}, P{chartData[0]?.pagamentos || 0}
      </div>
    </div>
  );
};

export default StaticForecastChart;