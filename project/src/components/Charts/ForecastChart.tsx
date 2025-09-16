import React from 'react';

interface ForecastData {
  month: string;
  revenue: number;
  expenses: number;
  balance: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  title: string;
  height?: number;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, title, height = 300 }) => {
  const maxValue = Math.max(
    ...data.flatMap(d => [d.revenue, d.expenses])
  );
  
  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const getBalanceY = (balance: number) => {
    const normalizedBalance = ((balance - minBalance) / (maxBalance - minBalance)) * 100;
    return 100 - normalizedBalance;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="relative" style={{ height }}>
        {/* Bars */}
        <div className="flex items-end justify-between h-full">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="flex items-end space-x-1 h-full w-full max-w-16">
                {/* Revenue Bar */}
                <div className="bg-blue-600 rounded-t-md flex-1 min-w-0 group relative">
                  <div
                    className="w-full bg-blue-600 rounded-t-md transition-all duration-300 hover:bg-blue-700"
                    style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
                
                {/* Expenses Bar */}
                <div className="bg-red-500 rounded-t-md flex-1 min-w-0 group relative">
                  <div
                    className="w-full bg-red-500 rounded-t-md transition-all duration-300 hover:bg-red-600"
                    style={{ height: `${(item.expenses / maxValue) * 100}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(item.expenses)}
                  </div>
                </div>
              </div>
              
              <span className="text-xs text-gray-600 font-medium">{item.month}</span>
            </div>
          ))}
        </div>

        {/* Balance Line Overlay */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          width="100%" 
          height="100%"
          style={{ zIndex: 5 }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            filter="url(#glow)"
            points={data.map((item, index) => {
              const x = ((index + 0.5) / data.length) * 100;
              const y = getBalanceY(item.balance);
              return `${x}%,${y}%`;
            }).join(' ')}
            className="drop-shadow-lg"
          />
          
          {/* Balance Points */}
          {data.map((item, index) => {
            const x = ((index + 0.5) / data.length) * 100;
            const y = getBalanceY(item.balance);
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#glow)"
                  className="cursor-pointer"
                />
                <text
                  x={`${x}%`}
                  y={`${y - 8}%`}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-green-700"
                  style={{ textShadow: '0 0 3px white' }}
                >
                  {formatCurrency(item.balance)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Receita Prevista</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Despesas Previstas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-xs text-gray-600">Saldo Final Previsto</span>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;