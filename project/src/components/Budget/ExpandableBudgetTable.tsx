import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetItem } from '../../types/financial';
import { dataService } from '../../services/dataService';

interface ExpandableBudgetTableProps {
  currentMonth: BudgetItem[];
  previousMonth1: BudgetItem[];
  previousMonth2: BudgetItem[];
  monthNames: string[];
  selectedPeriod?: { start: number; end: number };
}

const ExpandableBudgetTable: React.FC<ExpandableBudgetTableProps> = ({
  currentMonth,
  previousMonth1,
  previousMonth2,
  monthNames,
  selectedPeriod
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Get raw import data for period filtering
  const rawData = dataService.getRawImportData();
  
  // Parse currency values correctly (handle thousand "." and decimal ",", preserve negatives)
  const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value) return 0;
    
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

  // Generate filtered budget data based on selected period
  const getFilteredBudgetData = (): BudgetItem[] => {
    if (!rawData || !selectedPeriod) {
      console.log('No raw data or selected period, using current month data');
      return currentMonth;
    }
    
    const filteredData: BudgetItem[] = [];
    console.log('Filtering data for period:', selectedPeriod, 'Months:', monthNames);
    
    // Process data rows (starting from row 3, index 2)
    for (let i = 2; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (!row[0]) continue; // Skip empty rows
      
      const categoryName = String(row[0]).trim();
      
      // Calculate values for selected period
      let totalActual = 0;
      let totalForecast = 0;
      
      for (let monthIndex = selectedPeriod.start; monthIndex <= selectedPeriod.end; monthIndex++) {
        const forecastColIndex = 1 + (monthIndex * 2); // B, D, F, H, J, L, N, P, R, T, V, X
        const actualColIndex = 2 + (monthIndex * 2);   // C, E, G, I, K, M, O, Q, S, U, W, Y
        
        const forecastValue = parseCurrency(row[forecastColIndex]);
        const actualValue = parseCurrency(row[actualColIndex]);
        
        totalForecast += forecastValue;
        totalActual += actualValue;
      }
      
      // Determine account type
      const accountType = categoryName.toLowerCase().includes('receita') || 
                         categoryName.toLowerCase().includes('vendas') ? 'revenue' : 'expense';
      
      const budgetItem: BudgetItem = {
        id: `filtered-${i}`,
        code: `${i}.01`,
        category: categoryName,
        type: accountType,
        actual: totalActual,
        forecast: totalForecast,
        budgeted: totalForecast,
        accountType: 'analytical',
        level: 1
      };
      
      filteredData.push(budgetItem);
    }
    
    // Group 3.01.* under "Total de Recebimentos" (including Receitas de Vendas e Serviços), excluding the Total row as child
    const isTotalRecebimentosName = (name: string) => {
      const n = name.toLowerCase();
      return n.includes('total de recebimentos') || n.includes('total recebimentos') || n.includes('total de recebimento') || n.includes('total recebimento');
    };

    const isThreeZeroOneCategory = (name: string) => /^\s*3\.01(\.|\s|$)/.test(name);

    const parentIndex = filteredData.findIndex(item => isTotalRecebimentosName(item.category));
    const threeZeroOneChildren = filteredData.filter(item => 
      isThreeZeroOneCategory(item.category) &&
      !isTotalRecebimentosName(item.category)
    );

    if (threeZeroOneChildren.length > 0) {
      const sumActual = threeZeroOneChildren.reduce((s, it) => s + it.actual, 0);
      const sumForecast = threeZeroOneChildren.reduce((s, it) => s + it.forecast, 0);
      const sumBudgeted = threeZeroOneChildren.reduce((s, it) => s + it.budgeted, 0);

      if (parentIndex === -1) {
        // Create parent if missing
        const parent: BudgetItem = {
          id: 'receipts-total',
          code: '3.01',
          category: 'Total de Recebimentos',
          type: 'revenue',
          actual: sumActual,
          forecast: sumForecast,
          budgeted: sumBudgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: threeZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };

        const remaining = filteredData.filter(item => !threeZeroOneChildren.includes(item));
        filteredData.splice(0, filteredData.length, parent, ...remaining);
      } else {
        const parent = filteredData[parentIndex];
        const updatedParent: BudgetItem = {
          ...parent,
          code: parent.code || '3.01',
          type: 'revenue',
          // Preserve parent's totals from the spreadsheet row to match the card
          actual: parent.actual,
          forecast: parent.forecast,
          budgeted: parent.budgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: threeZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };

        const remaining = filteredData.filter((item, idx) => idx === parentIndex || !threeZeroOneChildren.includes(item));
        remaining[parentIndex] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    console.log('Filtered data (grouped 3.01 under Total de Recebimentos):', filteredData.length, 'items');
    
    // Group 4.01.* under "Despesas com Vendas e Serviços" (excluding the parent row itself)
    const isDespVendasServicos = (name: string) => {
      const n = name.toLowerCase();
      return n.includes('despesas com vendas') && n.includes('servi');
    };
    const isFourZeroOneCategory = (name: string) => /^\s*4\.01(\.|\s|$)/.test(name);

    let expenseParentIndex = filteredData.findIndex(item => isDespVendasServicos(item.category));
    const fourZeroOneChildren = filteredData.filter(item => 
      isFourZeroOneCategory(item.category) && !isDespVendasServicos(item.category)
    );

    if (fourZeroOneChildren.length > 0) {
      const sumActual = fourZeroOneChildren.reduce((s, it) => s + it.actual, 0);
      const sumForecast = fourZeroOneChildren.reduce((s, it) => s + it.forecast, 0);
      const sumBudgeted = fourZeroOneChildren.reduce((s, it) => s + it.budgeted, 0);

      if (expenseParentIndex === -1) {
        // Create parent if missing
        const parent: BudgetItem = {
          id: 'expenses-sales-services',
          code: '4.01',
          category: 'Despesas com Vendas e Serviços',
          type: 'expense',
          actual: sumActual,
          forecast: sumForecast,
          budgeted: sumBudgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: fourZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };

        const remaining = filteredData.filter(item => !fourZeroOneChildren.includes(item));
        filteredData.splice(0, filteredData.length, parent, ...remaining);
      } else {
        const parent = filteredData[expenseParentIndex];
        const updatedParent: BudgetItem = {
          ...parent,
          code: parent.code || '4.01',
          type: 'expense',
          // Preserve parent's totals from spreadsheet row
          actual: parent.actual,
          forecast: parent.forecast,
          budgeted: parent.budgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: fourZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };

        const remaining = filteredData.filter((item, idx) => idx === expenseParentIndex || !fourZeroOneChildren.includes(item));
        remaining[expenseParentIndex] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    // Group 3.04.* under the first topic that starts with 3.04 (exclude the parent itself)
    const isThreeZeroFourCategory = (name: string) => /^\s*3\.04(\.|\s|$)/.test(name);
    const threeZeroFourIndices = filteredData
      .map((item, idx) => ({ idx, item }))
      .filter(entry => isThreeZeroFourCategory(entry.item.category));

    if (threeZeroFourIndices.length > 1) {
      const parentIndex304 = threeZeroFourIndices[0].idx;
      const children304 = filteredData.filter((_, idx) => idx !== parentIndex304 && isThreeZeroFourCategory(filteredData[idx].category));

      const parent304 = filteredData[parentIndex304];
      const updatedParent304: BudgetItem = {
        ...parent304,
        code: parent304.code || '3.04',
        type: 'revenue',
        // Preserve parent's totals from spreadsheet row
        actual: parent304.actual,
        forecast: parent304.forecast,
        budgeted: parent304.budgeted,
        accountType: 'synthetic',
        level: 0,
        subcategories: children304.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
      };

      const remaining304 = filteredData.filter((item, idx) => idx === parentIndex304 || !isThreeZeroFourCategory(item.category));
      remaining304[parentIndex304] = updatedParent304;
      filteredData.splice(0, filteredData.length, ...remaining304);
    }

    // Generic grouping for any code prefix N.NN (e.g., 4.02, 4.03, 3.02, etc.)
    const alreadyHandled = new Set<string>(['3.01', '4.01', '3.04']);
    const prefixRegex = /^\s*(\d\.\d{2})(?=[\s.])/;
    const prefixToIndices = new Map<string, number[]>();

    filteredData.forEach((item, idx) => {
      const match = String(item.category || '').match(prefixRegex);
      if (!match) return;
      const prefix = match[1];
      if (alreadyHandled.has(prefix)) return;
      if (!prefixToIndices.has(prefix)) prefixToIndices.set(prefix, []);
      prefixToIndices.get(prefix)!.push(idx);
    });

    // Process each prefix with more than one occurrence
    for (const [prefix, indices] of prefixToIndices.entries()) {
      if (!indices || indices.length < 2) continue;

      // Pick first occurrence as parent
      const parentIndex = indices[0];
      // Children are remaining occurrences
      const childrenIndices = new Set(indices.slice(1));
      const children = filteredData.filter((_, idx) => childrenIndices.has(idx));
      if (children.length === 0) continue;

      const parent = filteredData[parentIndex];
      const parentType = parent.type || (prefix.startsWith('3.') ? 'revenue' : prefix.startsWith('4.') ? 'expense' : 'balance');
      const updatedParent: BudgetItem = {
        ...parent,
        code: parent.code || prefix,
        type: parentType as any,
        // Preserve parent's totals as provided
        actual: parent.actual,
        forecast: parent.forecast,
        budgeted: parent.budgeted,
        accountType: 'synthetic',
        level: 0,
        subcategories: children.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
      };

      const remaining = filteredData.filter((_, idx) => idx === parentIndex || !childrenIndices.has(idx));
      // Replace parent within remaining
      const parentPos = remaining.findIndex((_, i) => i === parentIndex);
      if (parentPos >= 0) {
        remaining[parentPos] = updatedParent;
      }
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Create synthetic "Despesa Operacional" grouping across multiple prefixes
    const operationalPrefixes = ['4.03', '4.04', '4.05', '4.06', '4.07', '4.08', '4.09', '4.10', '4.12'];
    const isOperational = (name: string) => {
      const trimmed = String(name || '').trim();
      return operationalPrefixes.some(pref => new RegExp(`^\\s*${pref}(\\.|\\s|$)`).test(trimmed));
    };
    const isOperationalParentName = (name: string) => String(name || '').trim().toLowerCase() === 'despesa operacional';

    const operationalItems = filteredData
      .map((item, idx) => ({ item, idx }))
      .filter(entry => isOperational(entry.item.category) && !isOperationalParentName(entry.item.category));

    if (operationalItems.length > 0) {
      const sumActual = operationalItems.reduce((sum, e) => sum + (e.item.actual || 0), 0);
      const sumForecast = operationalItems.reduce((sum, e) => sum + (e.item.forecast || 0), 0);
      const sumBudgeted = operationalItems.reduce((sum, e) => sum + (e.item.budgeted || 0), 0);

      const operationalParent: BudgetItem = {
        id: 'operational-expenses',
        code: '4.OP',
        category: 'Despesa Operacional',
        type: 'expense',
        actual: sumActual,
        forecast: sumForecast,
        budgeted: sumBudgeted,
        accountType: 'synthetic',
        level: 0,
        subcategories: operationalItems.map(e => ({ ...e.item }))
      };

      const toRemove = new Set(operationalItems.map(e => e.idx));
      let remaining = filteredData.filter((_, idx) => !toRemove.has(idx));

      // Find insert position: after Receitas de Financiamento/Financeira if present
      const isReceitasFinanciamento = (name: string) => {
        const n = String(name || '').toLowerCase();
        return (n.includes('receita') || n.includes('receitas')) && (n.includes('financ'));
      };
      let insertAfter = remaining.findIndex(item => isReceitasFinanciamento(item.category));
      if (insertAfter === -1) {
        // Fallback: after Despesas com Vendas e Serviços if exists
        const idxDesp = remaining.findIndex(item => {
          const n = String(item.category || '').toLowerCase();
          return n.includes('despesas com vendas') && n.includes('servi');
        });
        insertAfter = idxDesp;
      }
      if (insertAfter === -1) {
        // Append at end if no anchor found
        remaining = [...remaining, operationalParent];
      } else {
        remaining.splice(insertAfter + 1, 0, operationalParent);
      }
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Create "Despesas Não Operacionais" grouping (5.01 + 6.01) and place right after Despesa Operacional
    const isFiveZeroOne = (name: string) => /^\s*5\.01(\.|\s|$)/.test(String(name || ''));
    const isSixZeroOne = (name: string) => /^\s*6\.01(\.|\s|$)/.test(String(name || ''));
    const nonOpEntries = filteredData
      .map((item, idx) => ({ item, idx }))
      .filter(e => (isFiveZeroOne(e.item.category) || isSixZeroOne(e.item.category)) && String(e.item.category || '').trim().toLowerCase() !== 'despesas não operacionais');

    if (nonOpEntries.length > 0) {
      const sumActualNO = nonOpEntries.reduce((sum, e) => sum + (e.item.actual || 0), 0);
      const sumForecastNO = nonOpEntries.reduce((sum, e) => sum + (e.item.forecast || 0), 0);
      const sumBudgetedNO = nonOpEntries.reduce((sum, e) => sum + (e.item.budgeted || 0), 0);

      const nonOperationalParent: BudgetItem = {
        id: 'non-operational-expenses',
        code: '5-6.NO',
        category: 'Despesas Não Operacionais',
        type: 'expense',
        actual: sumActualNO,
        forecast: sumForecastNO,
        budgeted: sumBudgetedNO,
        accountType: 'synthetic',
        level: 0,
        subcategories: nonOpEntries.map(e => ({ ...e.item }))
      };

      const toRemoveNO = new Set(nonOpEntries.map(e => e.idx));
      const remainingNO = filteredData.filter((_, idx) => !toRemoveNO.has(idx));

      // Insert right after Despesa Operacional if present, else append
      const opIndex = remainingNO.findIndex(item => String(item.category || '').trim().toLowerCase() === 'despesa operacional');
      if (opIndex === -1) {
        filteredData.splice(0, filteredData.length, ...remainingNO, nonOperationalParent);
      } else {
        remainingNO.splice(opIndex + 1, 0, nonOperationalParent);
        filteredData.splice(0, filteredData.length, ...remainingNO);
      }
    }

    console.log('Filtered data (grouped with generic prefixes):', filteredData.length, 'items');
    return filteredData;
  };

  // Always use filtered data when selectedPeriod is available
  const displayData = selectedPeriod ? getFilteredBudgetData() : currentMonth;


  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getVariance = (actual: number, forecast: number) => {
    if (forecast === 0) return 0;
    return ((actual - forecast) / forecast) * 100;
  };

  const getMonthOverMonthChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
    return 'hover:bg-gray-50 bg-white';
  };

  const findItemById = (items: BudgetItem[], id: string): BudgetItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.subcategories) {
        const found = findItemById(item.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const renderTableRow = (item: BudgetItem, level: number = 0) => {
    const hasSubcategories = item.subcategories && item.subcategories.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const variance = getVariance(item.actual, item.forecast);
    const rowStyle = getRowStyle(item.type, item.accountType === 'synthetic' ? 0 : 1);
    const paddingLeft = level * 24;

    // Get historical data for month-over-month comparison
    const prevMonth1Item = findItemById(previousMonth1, item.id);
    const prevMonth2Item = findItemById(previousMonth2, item.id);
    
    const mom1Change = prevMonth1Item ? getMonthOverMonthChange(item.actual, prevMonth1Item.actual) : 0;
    const mom2Change = prevMonth2Item ? getMonthOverMonthChange(prevMonth1Item?.actual || 0, prevMonth2Item.actual) : 0;

    return (
      <React.Fragment key={item.id}>
        <tr className={`border-b border-gray-200 ${rowStyle}`}>
          <td className="px-6 py-4" style={{ paddingLeft: `${24 + paddingLeft}px` }}>
            <div className="flex items-center">
              {hasSubcategories && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
              <div>
                <div className="font-medium text-gray-900">{item.category}</div>
                {item.code && (
                  <div className="text-sm text-gray-500">{item.code}</div>
                )}
                {item.accountType === 'synthetic' && (
                  <div className="text-xs text-blue-600">Grupo Sintético</div>
                )}
              </div>
            </div>
          </td>
          
          {selectedPeriod ? (
            /* Period Total */
            <td className="px-6 py-4 text-right">
              <div className="space-y-1">
                <span className="font-medium block">{formatCurrency(item.actual)}</span>
                <div className="text-xs text-gray-500">
                  Período: {monthNames.join(' - ')}
                </div>
              </div>
            </td>
          ) : (
            <>
              {/* Current Month */}
              <td className="px-6 py-4 text-right">
                <div className="space-y-1">
                  <span className="font-medium block">{formatCurrency(item.actual)}</span>
                  {level === 0 && mom1Change !== 0 && (
                    <div className={`text-xs flex items-center justify-end ${mom1Change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mom1Change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {mom1Change > 0 ? '+' : ''}{mom1Change.toFixed(1)}%
                    </div>
                  )}
                </div>
              </td>
              
              {/* Previous Month 1 */}
              <td className="px-6 py-4 text-right">
                <div className="space-y-1">
                  <span className="font-medium block">{formatCurrency(prevMonth1Item?.actual || 0)}</span>
                  {level === 0 && mom2Change !== 0 && (
                    <div className={`text-xs flex items-center justify-end ${mom2Change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mom2Change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {mom2Change > 0 ? '+' : ''}{mom2Change.toFixed(1)}%
                    </div>
                  )}
                </div>
              </td>
              
              {/* Previous Month 2 */}
              <td className="px-6 py-4 text-right">
                <span className="font-medium">{formatCurrency(prevMonth2Item?.actual || 0)}</span>
              </td>
            </>
          )}
          
          <td className="px-6 py-4 text-right">
            <span className="font-medium">{formatCurrency(item.forecast)}</span>
          </td>
          
          <td className="px-6 py-4 text-right">
            <span className={`font-medium ${getVarianceColor(variance, item.type)}`}>
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
            </span>
          </td>
          
          <td className="px-6 py-4 text-right text-sm text-gray-600">
            {((item.actual / (displayData.find(i => i.type === 'revenue')?.actual || 1)) * 100).toFixed(1)}%
          </td>
        </tr>
        
        {hasSubcategories && isExpanded && item.subcategories?.map(subItem => 
          renderTableRow(subItem, level + 1)
        )}
      </React.Fragment>
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
            {selectedPeriod ? (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {monthNames.join(' - ')}
                <div className="text-xs font-normal text-gray-400 mt-1">Período Selecionado</div>
              </th>
            ) : (
              <>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {monthNames[2] || 'Atual'}
                  <div className="text-xs font-normal text-gray-400 mt-1">Atual</div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {monthNames[1] || 'Anterior'}
                  <div className="text-xs font-normal text-gray-400 mt-1">Anterior</div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {monthNames[0] || '2 Meses'}
                  <div className="text-xs font-normal text-gray-400 mt-1">2 Meses</div>
                </th>
              </>
            )}
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
          {displayData.map((item) => renderTableRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpandableBudgetTable;