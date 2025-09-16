import React from 'react';
import DateFilter from '../components/Layout/DateFilter';
import EnhancedKPICard from '../components/KPI/EnhancedKPICard';
import ExpandableBudgetTable from '../components/Budget/ExpandableBudgetTable';
import AIInsightsPanel from '../components/Analysis/AIInsightsPanel';
import { dataService } from '../services/dataService';

// Empty state component
const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    <p className="text-sm text-blue-600">
      Vá para a página de <strong>Importação</strong> para começar a importar seus dados.
    </p>
  </div>
);

const Dashboard: React.FC = () => {
  const [currentMonth, setCurrentMonth] = React.useState(8); // Default to September
  const [selectedPeriod, setSelectedPeriod] = React.useState({ start: 8, end: 8 }); // Default to September
  const isEmpty = dataService.isEmpty();
  const kpiData = dataService.getKPIData();
  const budgetData = dataService.getBudgetData();

  // Ensure KPIs reflect selected period on initial load as well
  React.useEffect(() => {
    if (!isEmpty) {
      dataService.updateKPIDataForPeriod(selectedPeriod.start, selectedPeriod.end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    // Align period to the selected month so cards and cash flow match
    setSelectedPeriod({ start: monthIndex, end: monthIndex });
    // KPI data is updated automatically by DateFilter component
    dataService.updateKPIDataForPeriod(monthIndex, monthIndex);
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    // Convert dates to month indices for consistency
    let start = new Date(startDate).getMonth();
    let end = new Date(endDate).getMonth();
    if (isNaN(start)) start = 0;
    if (isNaN(end)) end = 11;
    if (start > end) {
      const tmp = start; start = end; end = tmp;
    }
    setSelectedPeriod({ start, end });
    // Align KPI cards to the end month of the selected range
    dataService.updateKPIDataForPeriod(start, end);
  };

  // Portuguese month names matching import structure
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (isEmpty) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <DateFilter onDateChange={handleDateChange} onMonthChange={handleMonthChange} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <EmptyState 
            title="Nenhum dado encontrado"
            description="Não há dados financeiros para exibir. Importe seus dados para começar a usar o dashboard."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <DateFilter onDateChange={handleDateChange} onMonthChange={handleMonthChange} />
        {/* Dataset switcher */}
        {typeof window !== 'undefined' && (
          <div className="mt-2">
            <label className="text-sm text-gray-600 mr-2">Base:</label>
            <select
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              onChange={(e) => { dataService.setActiveDataset(e.target.value); dataService.updateKPIDataForPeriod(selectedPeriod.start, selectedPeriod.end); }}
              defaultValue={dataService.getActiveDatasetName() || ''}
            >
              {dataService.getDatasetNames().map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {kpiData.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {kpiData.map((kpi, index) => (
              <EnhancedKPICard key={index} data={kpi} />
            ))}
          </div>
        </div>
      )}

      {budgetData.length > 0 ? (
        <div className="space-y-8">
          {/* Cash Flow Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Fluxo de Caixa</h2>
              <p className="text-sm text-gray-600 mt-1">
                Análise detalhada das movimentações financeiras por período
              </p>
            </div>
            <ExpandableBudgetTable 
              currentMonth={budgetData}
              previousMonth1={[]}
              previousMonth2={[]}
              monthNames={monthNames.slice(selectedPeriod.start, selectedPeriod.end + 1)}
              selectedPeriod={selectedPeriod}
            />
          </div>

          {/* AI Suggestions & Analysis Panel */}
          <AIInsightsPanel 
            selectedPeriod={selectedPeriod}
            title="Sugestões e Análises IA"
            subtitle="Insights baseados nos últimos 3 meses de dados reais"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <EmptyState 
            title="Dados orçamentários não encontrados"
            description="Importe seus dados de forecast e dados reais para visualizar as análises completas."
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;