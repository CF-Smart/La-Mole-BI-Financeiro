import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface DateFilterProps {
  onDateChange: (startDate: string, endDate: string) => void;
  onMonthChange?: (monthIndex: number) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onDateChange, onMonthChange }) => {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(8); // mês único selecionado (Setembro)
  const [rangeStart, setRangeStart] = useState<number | null>(null); // índice do mês inicial
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);     // índice do mês final
  const [isOpen, setIsOpen] = useState(false);

  // Portuguese month names matching the import structure
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Aplicar seleção (mês único ou intervalo) ao clicar no botão Aplicar
  const handleApplyFilter = () => {
    let start: number | null = null;
    let end: number | null = null;

    if (rangeStart !== null && rangeEnd !== null) {
      start = Math.min(rangeStart, rangeEnd);
      end = Math.max(rangeStart, rangeEnd);
    } else if (selectedMonth !== null) {
      start = selectedMonth;
      end = selectedMonth;
    } else {
      start = 0;
      end = 11;
    }

    const startIso = `2025-${String((start as number) + 1).padStart(2, '0')}-01`;
    const endIso = `2025-${String((end as number) + 1).padStart(2, '0')}-01`;
    setStartDate(startIso);
    setEndDate(endIso);
    onDateChange(startIso, endIso);
    dataService.updateKPIDataForPeriod(start as number, end as number);
    setIsOpen(false);
  };

  const handleMonthChange = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    if (onMonthChange) {
      onMonthChange(monthIndex);
    }
    // Atualizar KPIs alinhado ao mesmo período (mês único)
    dataService.updateKPIDataForPeriod(monthIndex, monthIndex);
  };

  const presetRanges = [
    { label: 'Este Mês', start: '2025-03-01', end: '2025-03-31' },
    { label: 'Último Trimestre', start: '2025-01-01', end: '2025-03-31' },
    { label: 'Este Ano', start: '2025-01-01', end: '2025-12-31' },
    { label: 'Últimos 6 Meses', start: '2024-10-01', end: '2025-03-31' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
        <span className="text-sm text-gray-700">
          {selectedMonth === null ? 'Todos os meses 2025' : `${monthNames[selectedMonth]} 2025`}
        </span>
        <Filter className="h-4 w-4 text-gray-400 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Seleção de Mês</h3>
            
            {/* Seleção rápida */}
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-3">Selecione o Mês para Análise</p>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => { handleMonthChange(index); setIsOpen(false); }}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedMonth === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Sem ações: seleção aplica imediatamente */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;