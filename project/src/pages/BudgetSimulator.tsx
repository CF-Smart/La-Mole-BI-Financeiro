import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, TrendingUp, TrendingDown, Briefcase, Store, Building2 } from 'lucide-react';
import { BudgetItem } from '../types/financial';
import { dataService } from '../services/dataService';

// Empty state component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Simulador não disponível</h3>
    <p className="text-gray-500 mb-4">
      Não há dados orçamentários para simular. Importe seus dados primeiro.
    </p>
    <p className="text-sm text-blue-600">
      Vá para a página de <strong>Importação</strong> para importar dados de forecast e dados reais.
    </p>
  </div>
);

const BudgetSimulator: React.FC = () => {
  const budgetData = dataService.getBudgetData();
  const [editableBudgetData, setEditableBudgetData] = useState<BudgetItem[]>(budgetData);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'budgeted' | 'actual' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // Setembro padrão
  const [sector, setSector] = useState<'servicos' | 'comercio' | 'industria'>('servicos');
  const [scenarioSaved, setScenarioSaved] = useState<boolean>(false);
  const [cashForecast, setCashForecast] = useState<number>(0);
  // selectedMonth já declarado acima; usar o mesmo para leitura dos realizados

  // If no data, show empty state
  if (budgetData.length === 0) {
    return (
      <div className="p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulador Orçamentário</h1>
          <p className="text-gray-600">Simule cenários e analise margens financeiras</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  // Load scenario from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simulatorScenario');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedMonth === 'number') setSelectedMonth(parsed.selectedMonth);
        if (parsed.sector === 'servicos' || parsed.sector === 'comercio' || parsed.sector === 'industria') setSector(parsed.sector);
        if (typeof parsed.cashForecast === 'number') setCashForecast(parsed.cashForecast);
        setScenarioSaved(true);
      } catch {}
    }
  }, []);

  // Brazilian number formatting
  const formatBrazilianNumber = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const formatCurrency = (value: number): string => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  const parseBrazilianNumber = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Helpers: código e tipo por prefixo
  const extractCodePrefix = (nameOrCode: string): string | null => {
    const m = String(nameOrCode || '').trim().match(/^\s*(\d\.\d{2})(?=[\s.])/);
    return m ? m[1] : null;
  };

  const inferTypeByCode = (code?: string, fallback?: 'revenue' | 'expense' | 'balance'): 'revenue' | 'expense' | 'balance' => {
    if (code?.startsWith('3.')) return 'revenue';
    if (/^(4|5|6)\./.test(String(code || ''))) return 'expense';
    return fallback || 'balance';
  };

  // Calculate parent category values from children
  const getCalculatedBudgetedValue = (item: BudgetItem): number => {
    if (!item.subcategories || item.subcategories.length === 0) {
      return item.budgeted;
    }
    
    return item.subcategories.reduce((sum, child) => {
      const childValue = getCalculatedBudgetedValue(child);
      return item.type === 'expense' ? sum + childValue : sum + childValue;
    }, 0);
  };

  // Find item by ID in nested structure
  const findItemById = (items: BudgetItem[], id: string): BudgetItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.subcategories) {
        const found = findItemById(item.subcategories, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Update item in nested structure
  const updateItemByIdField = (items: BudgetItem[], id: string, field: 'budgeted' | 'actual', newValue: number): BudgetItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: newValue } as BudgetItem;
      }
      if (item.subcategories) {
        return {
          ...item,
          subcategories: updateItemByIdField(item.subcategories, id, field, newValue)
        };
      }
      return item;
    });
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleValueChange = (id: string, field: 'budgeted' | 'actual', value: string) => {
    const item = findItemById(editableBudgetData, id);
    if (!item || item.accountType === 'synthetic') return; // edit only analytical
    const numericValue = parseBrazilianNumber(value);
    const updatedData = updateItemByIdField(editableBudgetData, id, field, numericValue);
    const recalculatedData = recalculateParentTotals(updatedData);
    setEditableBudgetData(recalculatedData);
  };

  const startEditing = (id: string, field: 'budgeted' | 'actual', currentValue: number) => {
    if (!scenarioSaved) return; // precisa salvar cenário antes de editar
    const item = findItemById(editableBudgetData, id);
    if (!item || item.accountType === 'synthetic') return; // Don't allow editing synthetic accounts
    
    setEditingItem(id);
    setEditingField(field);
    setEditValue(formatBrazilianNumber(currentValue));
  };
  
  // Recalculate parent totals based on children
  const recalculateParentTotals = (items: BudgetItem[]): BudgetItem[] => {
    return items.map(item => {
      if (item.subcategories && item.subcategories.length > 0) {
        const recalculatedChildren = recalculateParentTotals(item.subcategories);
        const newBudgeted = recalculatedChildren.reduce((sum, child) => sum + child.budgeted, 0);
        const newActual = recalculatedChildren.reduce((sum, child) => sum + child.actual, 0);
        const newForecast = recalculatedChildren.reduce((sum, child) => sum + child.forecast, 0);
        
        return {
          ...item,
          subcategories: recalculatedChildren,
          budgeted: newBudgeted,
          actual: newActual,
          forecast: newForecast
        };
      }
      return item;
    });
  };

  const finishEditing = () => {
    if (editingItem && editingField) {
      handleValueChange(editingItem, editingField, editValue);
    }
    setEditingItem(null);
    setEditingField(null);
    setEditValue('');
  };

  // (Removido) edição em massa de receitas

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue('');
  };

  // Calculate margins seguindo a regra informada (Realizado ou Cenário editado)
  const calculateMargins = () => {
    const expectedMargin = sector === 'servicos' ? 30 : sector === 'comercio' ? 15 : 10;

    // If cenário salvo, usar valores editados (budgeted) por prefixo
    if (scenarioSaved && editableBudgetData.length > 0) {
      const sumBudgetedByPrefix = (items: BudgetItem[], prefix: string): number => {
        let sum = 0;
        for (const item of items) {
          const code = String(item.code || '');
          if (code.startsWith(prefix)) {
            sum += item.subcategories && item.subcategories.length > 0
              ? item.subcategories.reduce((s, c) => s + (c.budgeted || 0), 0)
              : (item.budgeted || 0);
          }
          if (item.subcategories && item.subcategories.length > 0) {
            sum += sumBudgetedByPrefix(item.subcategories, prefix);
          }
        }
        return sum;
      };

      const revenueDenPrefixes = ['3.01', '3.02', '3.04'];
      const numPrefixes = ['3.01', '3.02', '3.04', '4.01','4.02','4.03','4.04','4.05','4.06','4.07','4.08','4.09','4.10','4.11','4.12'];

      const revenueDen = revenueDenPrefixes.reduce((s, p) => s + sumBudgetedByPrefix(editableBudgetData, p), 0);
      const numerator = numPrefixes.reduce((s, p) => s + sumBudgetedByPrefix(editableBudgetData, p), 0);
      const currentMargin = revenueDen !== 0 ? (numerator / revenueDen) * 100 : 0;
      const difference = currentMargin - expectedMargin;
      return { currentMargin, expectedMargin, difference };
    }

    // Caso contrário, usar Realizado do mês (raw)
    const raw = dataService.getRawImportData();
    if (!raw || raw.length === 0) return { currentMargin: 0, expectedMargin: 0, difference: 0 };

    const actualColIndex = 2 + (selectedMonth * 2);
    const getSumByPrefixReal = (prefix: string) => {
      let sum = 0;
      for (let i = 3; i < raw.length; i++) {
        const row = raw[i] as any[];
        const name = String(row[0] || '').trim();
        if (name.startsWith(prefix)) {
          const val = Number(String(row[actualColIndex] || '0').replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.'));
          sum += isNaN(val) ? 0 : val;
        }
      }
      return sum;
    };

    const revenueDenPrefixes = ['3.01', '3.02', '3.04'];
    const numPrefixes = ['3.01', '3.02', '3.04', '4.01','4.02','4.03','4.04','4.05','4.06','4.07','4.08','4.09','4.10','4.11','4.12'];
    const revenueDen = revenueDenPrefixes.reduce((s, p) => s + getSumByPrefixReal(p), 0);
    const numerator = numPrefixes.reduce((s, p) => s + getSumByPrefixReal(p), 0);
    const currentMargin = revenueDen !== 0 ? (numerator / revenueDen) * 100 : 0;
    const difference = currentMargin - expectedMargin;
    return { currentMargin, expectedMargin, difference };
  };

  const { currentMargin, expectedMargin, difference } = calculateMargins();

  // Saldos de caixa
  const getSaldoFinalCaixa = (): number => {
    const raw = dataService.getRawImportData();
    if (!raw || raw.length === 0) return 0;
    const actualColIndex = 2 + (selectedMonth * 2);
    const names = ['Saldo Final de Caixa','Saldo Final','Saldo Final Líquido (Caixa)'];
    for (let i = 2; i < raw.length; i++) {
      const row = raw[i] as any[];
      const name = String(row[0] || '').trim();
      if (names.some(n => name.toLowerCase().includes(n.toLowerCase()))) {
        const val = Number(String(row[actualColIndex] || '0').replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.'));
        return isNaN(val) ? 0 : val;
      }
    }
    return 0;
  };
  const saldoAtual = getSaldoFinalCaixa();
  // Saldo previsto (cenário) calculado automaticamente a partir dos valores editados
  const computeSaldoPrevistoFromScenario = (): number => {
    if (!scenarioSaved || editableBudgetData.length === 0) return saldoAtual;
    // Heurística: saldo previsto = saldo atual + (Receitas do cenário - Despesas do cenário)
    const sumByType = (items: BudgetItem[], type: 'revenue' | 'expense'): number => {
      let sum = 0;
      for (const item of items) {
        if (item.type === type) {
          const val = item.subcategories && item.subcategories.length > 0
            ? item.subcategories.reduce((s, c) => s + (c.budgeted || 0), 0)
            : (item.budgeted || 0);
          sum += val;
        }
        if (item.subcategories && item.subcategories.length > 0) sum += sumByType(item.subcategories, type);
      }
      return sum;
    };
    const totalReceitas = sumByType(editableBudgetData, 'revenue');
    const totalDespesas = sumByType(editableBudgetData, 'expense');
    return saldoAtual + (totalReceitas + totalDespesas); // despesas negativas
  };
  const saldoPrevisto = computeSaldoPrevistoFromScenario();
  const saldoDiferenca = saldoAtual - saldoPrevisto;

  // Constrói dados a partir do RAW (cenário original)
  const buildDisplayDataFromRaw = (): BudgetItem[] => {
    // Se o cenário foi salvo, baseia-se nos dados editáveis (para permitir edição refletir na visão)
    if (scenarioSaved && editableBudgetData.length > 0) {
      // Achata a hierarquia em uma lista plana preservando ids/códigos
      const flat: BudgetItem[] = [];
      const walk = (items: BudgetItem[]) => {
        items.forEach(it => {
          const { subcategories, ...rest } = it as any;
          flat.push({ ...(rest as BudgetItem), accountType: it.accountType, level: it.level });
          if (it.subcategories && it.subcategories.length > 0) walk(it.subcategories);
        });
      };
      walk(editableBudgetData);

      // Trabalha sobre uma cópia e remove qualquer linha "Total de Recebimentos"
      const isTotalRecebimentosName = (name: string) => {
        const n = String(name || '').toLowerCase();
        return n.includes('total de recebimentos') || n.includes('total recebimentos') || n.includes('total de recebimento') || n.includes('total recebimento');
      };
      const filteredData: BudgetItem[] = flat
        .map(it => ({ ...it, subcategories: undefined }))
        .filter(it => !isTotalRecebimentosName(it.category));

      // Helpers por código e nome
      const hasPrefix = (code: string | undefined, prefix: string) => !!code && code.startsWith(prefix);
      const nameIs = (name: string | undefined, predicate: (n: string) => boolean) => name ? predicate(name.toLowerCase()) : false;

      // 4.01 Despesas com Vendas e Serviços
      const isDespVendasServicos = (name: string) => nameIs(name, n => n.includes('despesas com vendas') && n.includes('servi'));
      let parentIndex401 = filteredData.findIndex(item => isDespVendasServicos(item.category));
      const fourZeroOneChildren = filteredData.filter(item => hasPrefix(item.code, '4.01') && !isDespVendasServicos(item.category));
      if (fourZeroOneChildren.length > 0) {
        const parent = parentIndex401 === -1 ? null : filteredData[parentIndex401];
        const updatedParent: BudgetItem = parent ? { ...parent } : { id: 'expenses-sales-services', code: '4.01', category: 'Despesas com Vendas e Serviços', type: 'expense', actual: 0, forecast: 0, budgeted: 0, accountType: 'synthetic', level: 0 } as BudgetItem;
        updatedParent.subcategories = fourZeroOneChildren.map(c => ({ ...c, accountType: 'analytical', level: 1 }));
        if (parentIndex401 === -1) {
          const remaining = filteredData.filter(item => !fourZeroOneChildren.includes(item));
          filteredData.splice(0, filteredData.length, updatedParent, ...remaining);
        } else {
          const remaining = filteredData.filter((item, idx) => idx === parentIndex401 || !fourZeroOneChildren.includes(item));
          remaining[parentIndex401] = updatedParent;
          filteredData.splice(0, filteredData.length, ...remaining);
        }
      }

      // (Opcional) 3.04 já incluso no agrupamento de receitas acima

      // Genérico N.NN
      const alreadyHandled = new Set<string>(['3.00', '3.01', '3.02', '3.03', '3.04', '4.01']);
      const prefixRegex = /^(\d\.\d{2})/;
      const byPrefix = new Map<string, number[]>();
      filteredData.forEach((item, idx) => {
        const match = (item.code || '').match(prefixRegex);
        if (!match) return;
        const prefix = match[1];
        if (alreadyHandled.has(prefix)) return;
        if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
        byPrefix.get(prefix)!.push(idx);
      });
      for (const [prefix, indices] of byPrefix.entries()) {
        if (!indices || indices.length < 2) continue;
        const parentIndex = indices[0];
        const childrenIdx = new Set(indices.slice(1));
        const children = filteredData.filter((_, idx) => childrenIdx.has(idx));
        if (children.length === 0) continue;
        const parent = filteredData[parentIndex];
        const parentType = parent.type || (prefix.startsWith('3.') ? 'revenue' : prefix.startsWith('4.') ? 'expense' : 'balance');
        const updatedParent: BudgetItem = { ...parent, code: parent.code || prefix, type: parentType as any, accountType: 'synthetic', level: 0, subcategories: children.map(c => ({ ...c, accountType: 'analytical', level: 1 })) };
        const remaining = filteredData.filter((_, idx) => idx === parentIndex || !childrenIdx.has(idx));
        const parentPos = remaining.findIndex((_, i) => i === parentIndex);
        if (parentPos >= 0) remaining[parentPos] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }

      return filteredData;
    }

    // Caso contrário, construir a partir do raw (Realizado do mês)
    const raw = dataService.getRawImportData();
    if (!raw || raw.length === 0) return editableBudgetData;

    // Utilitário de parsing
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
      if (isNegative && parsed > 0) parsed = -parsed;
      return parsed;
    };

    const list: BudgetItem[] = [];
    const actualColIndex = 2 + (selectedMonth * 2);
    const forecastColIndex = 1 + (selectedMonth * 2);
    for (let i = 2; i < raw.length; i++) {
      const row = raw[i] as any[];
      if (!row[0]) continue;
      const categoryName = String(row[0]).trim();
      const actual = parseCurrency(row[actualColIndex]);
      const forecast = parseCurrency(row[forecastColIndex]);
      const detectedPrefix = extractCodePrefix(categoryName);
      const code = detectedPrefix || `${i}.00`;
      const type = inferTypeByCode(detectedPrefix || undefined, (categoryName.toLowerCase().includes('receita') || categoryName.toLowerCase().includes('vendas')) ? 'revenue' : 'expense');
      list.push({ id: `sim-${i}`, code, category: categoryName, type: type as any, actual, forecast, budgeted: forecast, accountType: 'analytical', level: 1 });
    }

    const filteredData: BudgetItem[] = [...list];

    // 3.01 dentro de Total de Recebimentos
    const isTotalRecebimentosName = (name: string) => {
      const n = name.toLowerCase();
      return n.includes('total de recebimentos') || n.includes('total recebimentos') || n.includes('total de recebimento') || n.includes('total recebimento');
    };
    const isThreeZeroOneCategory = (name: string) => /^\s*3\.01(\.|\s|$)/.test(name);
    let parentIndex301 = filteredData.findIndex(item => isTotalRecebimentosName(item.category));
    const threeZeroOneChildren = filteredData.filter(item => isThreeZeroOneCategory(item.category) && !isTotalRecebimentosName(item.category));
    if (threeZeroOneChildren.length > 0) {
      const sumActual = threeZeroOneChildren.reduce((s, it) => s + it.actual, 0);
      const sumForecast = threeZeroOneChildren.reduce((s, it) => s + it.forecast, 0);
      const sumBudgeted = threeZeroOneChildren.reduce((s, it) => s + it.budgeted, 0);
      if (parentIndex301 === -1) {
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
        const parent = filteredData[parentIndex301];
        const updatedParent: BudgetItem = {
          ...parent,
          code: parent.code || '3.01',
          type: 'revenue',
          actual: parent.actual,
          forecast: parent.forecast,
          budgeted: parent.budgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: threeZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };
        const remaining = filteredData.filter((item, idx) => idx === parentIndex301 || !threeZeroOneChildren.includes(item));
        remaining[parentIndex301] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    // 4.01 dentro de Despesas com Vendas e Serviços
    const isDespVendasServicos = (name: string) => {
      const n = name.toLowerCase();
      return n.includes('despesas com vendas') && n.includes('servi');
    };
    const isFourZeroOneCategory = (name: string) => /^\s*4\.01(\.|\s|$)/.test(name);
    let parentIndex401 = filteredData.findIndex(item => isDespVendasServicos(item.category));
    const fourZeroOneChildren = filteredData.filter(item => isFourZeroOneCategory(item.category) && !isDespVendasServicos(item.category));
    if (fourZeroOneChildren.length > 0) {
      const sumActual = fourZeroOneChildren.reduce((s, it) => s + it.actual, 0);
      const sumForecast = fourZeroOneChildren.reduce((s, it) => s + it.forecast, 0);
      const sumBudgeted = fourZeroOneChildren.reduce((s, it) => s + it.budgeted, 0);
      if (parentIndex401 === -1) {
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
        const parent = filteredData[parentIndex401];
        const updatedParent: BudgetItem = {
          ...parent,
          code: parent.code || '4.01',
          type: 'expense',
          actual: parent.actual,
          forecast: parent.forecast,
          budgeted: parent.budgeted,
          accountType: 'synthetic',
          level: 0,
          subcategories: fourZeroOneChildren.map(child => ({ ...child, accountType: 'analytical', level: 1 }))
        };
        const remaining = filteredData.filter((item, idx) => idx === parentIndex401 || !fourZeroOneChildren.includes(item));
        remaining[parentIndex401] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    // 3.04 agrupado sob o primeiro 3.04
    const isThreeZeroFourCategory = (name: string) => /^\s*3\.04(\.|\s|$)/.test(name);
    const threeZeroFourIndices = filteredData.map((item, idx) => ({ item, idx })).filter(e => isThreeZeroFourCategory(e.item.category));
    if (threeZeroFourIndices.length > 1) {
      const pIdx = threeZeroFourIndices[0].idx;
      const children = filteredData.filter((_, idx) => idx !== pIdx && isThreeZeroFourCategory(filteredData[idx].category));
      const parent = filteredData[pIdx];
      const updatedParent: BudgetItem = {
        ...parent,
        code: parent.code || '3.04',
        type: 'revenue',
        accountType: 'synthetic',
        level: 0,
        subcategories: children.map(c => ({ ...c, accountType: 'analytical', level: 1 }))
      };
      const remaining = filteredData.filter((item, idx) => idx === pIdx || !isThreeZeroFourCategory(item.category));
      remaining[pIdx] = updatedParent;
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Agrupamentos genéricos por prefixo N.NN
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
    for (const [prefix, indices] of prefixToIndices.entries()) {
      if (!indices || indices.length < 2) continue;
      const parentIndex = indices[0];
      const childrenIdx = new Set(indices.slice(1));
      const children = filteredData.filter((_, idx) => childrenIdx.has(idx));
      if (children.length === 0) continue;
      const parent = filteredData[parentIndex];
      const parentType = parent.type || (prefix.startsWith('3.') ? 'revenue' : prefix.startsWith('4.') ? 'expense' : 'balance');
      const updatedParent: BudgetItem = {
        ...parent,
        code: parent.code || prefix,
        type: parentType as any,
        accountType: 'synthetic',
        level: 0,
        subcategories: children.map(c => ({ ...c, accountType: 'analytical', level: 1 }))
      };
      const remaining = filteredData.filter((_, idx) => idx === parentIndex || !childrenIdx.has(idx));
      const parentPos = remaining.findIndex((_, i) => i === parentIndex);
      if (parentPos >= 0) remaining[parentPos] = updatedParent;
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Despesa Operacional
    const operationalPrefixes = ['4.03', '4.04', '4.05', '4.06', '4.07', '4.08', '4.09', '4.10', '4.12'];
    const isOperational = (name: string) => operationalPrefixes.some(pref => new RegExp(`^\\s*${pref}(\\.|\\s|$)`).test(String(name || '').trim()));
    const opItems = filteredData.map((item, idx) => ({ item, idx })).filter(e => isOperational(e.item.category) && String(e.item.category || '').trim().toLowerCase() !== 'despesa operacional');
    if (opItems.length > 0) {
      const sumActual = opItems.reduce((s, e) => s + (e.item.actual || 0), 0);
      const sumForecast = opItems.reduce((s, e) => s + (e.item.forecast || 0), 0);
      const sumBudgeted = opItems.reduce((s, e) => s + (e.item.budgeted || 0), 0);
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
        subcategories: opItems.map(e => ({ ...e.item }))
      };
      const toRemove = new Set(opItems.map(e => e.idx));
      let remaining = filteredData.filter((_, idx) => !toRemove.has(idx));
      const anchor = remaining.findIndex(it => isDespVendasServicos(it.category));
      if (anchor === -1) remaining = [operationalParent, ...remaining]; else remaining.splice(anchor + 1, 0, operationalParent);
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Despesas Não Operacionais (5.01 + 6.01)
    const isFiveZeroOne = (name: string) => /^\s*5\.01(\.|\s|$)/.test(String(name || ''));
    const isSixZeroOne = (name: string) => /^\s*6\.01(\.|\s|$)/.test(String(name || ''));
    const noItems = filteredData.map((item, idx) => ({ item, idx })).filter(e => (isFiveZeroOne(e.item.category) || isSixZeroOne(e.item.category)) && String(e.item.category || '').trim().toLowerCase() !== 'despesas não operacionais');
    if (noItems.length > 0) {
      const sumActual = noItems.reduce((s, e) => s + (e.item.actual || 0), 0);
      const sumForecast = noItems.reduce((s, e) => s + (e.item.forecast || 0), 0);
      const sumBudgeted = noItems.reduce((s, e) => s + (e.item.budgeted || 0), 0);
      const nonOpParent: BudgetItem = {
        id: 'non-operational-expenses',
        code: '5-6.NO',
        category: 'Despesas Não Operacionais',
        type: 'expense',
        actual: sumActual,
        forecast: sumForecast,
        budgeted: sumBudgeted,
        accountType: 'synthetic',
        level: 0,
        subcategories: noItems.map(e => ({ ...e.item }))
      };
      const toRemove = new Set(noItems.map(e => e.idx));
      const remaining = filteredData.filter((_, idx) => !toRemove.has(idx));
      const opIndex = remaining.findIndex(it => String(it.category || '').trim().toLowerCase() === 'despesa operacional');
      if (opIndex === -1) {
        filteredData.splice(0, filteredData.length, ...remaining, nonOpParent);
      } else {
        remaining.splice(opIndex + 1, 0, nonOpParent);
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    return filteredData;
  };

  // Constrói dados a partir do cenário editável (mantém mesma ordem e agrupamento)
  const buildDisplayDataFromEditable = (): BudgetItem[] => {
    if (!scenarioSaved || editableBudgetData.length === 0) return buildDisplayDataFromRaw();

    // Achatar estrutura editável
    const flat: BudgetItem[] = [];
    const walk = (items: BudgetItem[]) => {
      items.forEach(it => {
        const { subcategories, ...rest } = it as any;
        flat.push({ ...(rest as BudgetItem), accountType: it.accountType, level: it.level });
        if (it.subcategories && it.subcategories.length > 0) walk(it.subcategories);
      });
    };
    walk(editableBudgetData);

    // Reaproveitar o mesmo pipeline de agrupamento do RAW
    // Copiamos o trecho após a criação de 'list' na função anterior
    const filteredData: BudgetItem[] = [...flat.map(it => ({ ...it, subcategories: undefined }))];

    const parseBool = (v: any) => !!v;
    const isDespVendasServicos = (name: string) => {
      const n = String(name || '').toLowerCase();
      return n.includes('despesas com vendas') && n.includes('servi');
    };
    let parentIndex401 = filteredData.findIndex(item => isDespVendasServicos(item.category));
    const isFourZeroOneCategory = (name: string) => /^\s*4\.01(\.|\s|$)/.test(String(name || ''));
    const fourZeroOneChildren = filteredData.filter(item => isFourZeroOneCategory(item.category) && !isDespVendasServicos(item.category));
    if (fourZeroOneChildren.length > 0) {
      const parent = parentIndex401 === -1 ? null : filteredData[parentIndex401];
      const updatedParent: BudgetItem = parent ? { ...parent } : { id: 'expenses-sales-services', code: '4.01', category: 'Despesas com Vendas e Serviços', type: 'expense', actual: 0, forecast: 0, budgeted: 0, accountType: 'synthetic', level: 0 } as BudgetItem;
      updatedParent.subcategories = fourZeroOneChildren.map(c => ({ ...c, accountType: 'analytical', level: 1 }));
      if (parentIndex401 === -1) {
        const remaining = filteredData.filter(item => !fourZeroOneChildren.includes(item));
        filteredData.splice(0, filteredData.length, updatedParent, ...remaining);
      } else {
        const remaining = filteredData.filter((item, idx) => idx === parentIndex401 || !fourZeroOneChildren.includes(item));
        remaining[parentIndex401] = updatedParent;
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    // 3.04 agrupado sob o primeiro 3.04 (mesma lógica)
    const isThreeZeroFourCategory = (name: string) => /^\s*3\.04(\.|\s|$)/.test(String(name || ''));
    const threeZeroFourIndices = filteredData.map((item, idx) => ({ item, idx })).filter(e => isThreeZeroFourCategory(e.item.category));
    if (threeZeroFourIndices.length > 1) {
      const pIdx = threeZeroFourIndices[0].idx;
      const children = filteredData.filter((_, idx) => idx !== pIdx && isThreeZeroFourCategory(filteredData[idx].category));
      const parent = filteredData[pIdx];
      const updatedParent: BudgetItem = {
        ...parent,
        code: parent.code || '3.04',
        type: 'revenue',
        accountType: 'synthetic',
        level: 0,
        subcategories: children.map(c => ({ ...c, accountType: 'analytical', level: 1 }))
      };
      const remaining = filteredData.filter((item, idx) => idx === pIdx || !isThreeZeroFourCategory(item.category));
      remaining[pIdx] = updatedParent;
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Agrupamentos genéricos por prefixo N.NN (igual RAW, sem criar Total Recebimentos)
    const alreadyHandled = new Set<string>(['4.01', '3.04']);
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
    for (const [prefix, indices] of prefixToIndices.entries()) {
      if (!indices || indices.length < 2) continue;
      const parentIndex = indices[0];
      const childrenIdx = new Set(indices.slice(1));
      const children = filteredData.filter((_, idx) => childrenIdx.has(idx));
      if (children.length === 0) continue;
      const parent = filteredData[parentIndex];
      const parentType = parent.type || (prefix.startsWith('3.') ? 'revenue' : prefix.startsWith('4.') ? 'expense' : 'balance');
      const updatedParent: BudgetItem = {
        ...parent,
        code: parent.code || prefix,
        type: parentType as any,
        accountType: 'synthetic',
        level: 0,
        subcategories: children.map(c => ({ ...c, accountType: 'analytical', level: 1 }))
      };
      const remaining = filteredData.filter((_, idx) => idx === parentIndex || !childrenIdx.has(idx));
      const parentPos = remaining.findIndex((_, i) => i === parentIndex);
      if (parentPos >= 0) remaining[parentPos] = updatedParent;
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Despesa Operacional (igual RAW)
    const operationalPrefixes = ['4.03', '4.04', '4.05', '4.06', '4.07', '4.08', '4.09', '4.10', '4.12'];
    const isOperational = (name: string) => operationalPrefixes.some(pref => new RegExp(`^\\s*${pref}(\\.|\\s|$)`).test(String(name || '').trim()));
    const opItems = filteredData.map((item, idx) => ({ item, idx })).filter(e => isOperational(e.item.category) && String(e.item.category || '').trim().toLowerCase() !== 'despesa operacional');
    if (opItems.length > 0) {
      const sumActual = opItems.reduce((s, e) => s + (e.item.actual || 0), 0);
      const sumForecast = opItems.reduce((s, e) => s + (e.item.forecast || 0), 0);
      const sumBudgeted = opItems.reduce((s, e) => s + (e.item.budgeted || 0), 0);
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
        subcategories: opItems.map(e => ({ ...e.item }))
      };
      const toRemove = new Set(opItems.map(e => e.idx));
      let remaining = filteredData.filter((_, idx) => !toRemove.has(idx));
      const anchor = remaining.findIndex(it => isDespVendasServicos(it.category));
      if (anchor === -1) remaining = [operationalParent, ...remaining]; else remaining.splice(anchor + 1, 0, operationalParent);
      filteredData.splice(0, filteredData.length, ...remaining);
    }

    // Despesas Não Operacionais (igual RAW)
    const isFiveZeroOne = (name: string) => /^\s*5\.01(\.|\s|$)/.test(String(name || ''));
    const isSixZeroOne = (name: string) => /^\s*6\.01(\.|\s|$)/.test(String(name || ''));
    const noItems = filteredData.map((item, idx) => ({ item, idx })).filter(e => (isFiveZeroOne(e.item.category) || isSixZeroOne(e.item.category)) && String(e.item.category || '').trim().toLowerCase() !== 'despesas não operacionais');
    if (noItems.length > 0) {
      const sumActual = noItems.reduce((s, e) => s + (e.item.actual || 0), 0);
      const sumForecast = noItems.reduce((s, e) => s + (e.item.forecast || 0), 0);
      const sumBudgeted = noItems.reduce((s, e) => s + (e.item.budgeted || 0), 0);
      const nonOpParent: BudgetItem = {
        id: 'non-operational-expenses',
        code: '5-6.NO',
        category: 'Despesas Não Operacionais',
        type: 'expense',
        actual: sumActual,
        forecast: sumForecast,
        budgeted: sumBudgeted,
        accountType: 'synthetic',
        level: 0,
        subcategories: noItems.map(e => ({ ...e.item }))
      };
      const toRemove = new Set(noItems.map(e => e.idx));
      const remaining = filteredData.filter((_, idx) => !toRemove.has(idx));
      const opIndex = remaining.findIndex(it => String(it.category || '').trim().toLowerCase() === 'despesa operacional');
      if (opIndex === -1) {
        filteredData.splice(0, filteredData.length, ...remaining, nonOpParent);
      } else {
        remaining.splice(opIndex + 1, 0, nonOpParent);
        filteredData.splice(0, filteredData.length, ...remaining);
      }
    }

    return filteredData;
  };

  const renderBudgetItem = (item: BudgetItem, level: number = 0, allowEdit: boolean = true): React.ReactNode => {
    const hasChildren = item.subcategories && item.subcategories.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isEditing = editingItem === item.id;
    const isSynthetic = item.accountType === 'synthetic';
    const calculatedBudgeted = getCalculatedBudgetedValue(item);
    
    // Diferença entre Real x Forecast
    const varianceAbs = (item.actual || 0) - (item.forecast || 0);
    const variancePct = (item.forecast || 0) !== 0 ? (varianceAbs / item.forecast) * 100 : 0;
    
    const getRowColor = () => {
      const code = item.code || extractCodePrefix(item.category) || '';
      const t = inferTypeByCode(code, item.type);
      if (t === 'revenue') return 'bg-green-50 border-green-200';
      if (t === 'expense') return 'bg-red-50 border-red-200';
      return 'bg-blue-50 border-blue-200';
    };

    return (
      <React.Fragment key={item.id}>
        <tr className={`${getRowColor()} border-b hover:bg-opacity-80 transition-colors`}>
          <td className="px-4 py-3">
            <div 
              className="flex items-center cursor-pointer"
              style={{ paddingLeft: `${level * 20}px` }}
              onClick={() => hasChildren && toggleExpanded(item.id)}
            >
              {hasChildren && (
                <span className="mr-2 text-gray-500">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
              <span className={`font-medium ${level > 0 ? 'text-sm' : 'text-base'}`}>
                {item.category}
              </span>
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end">
              {allowEdit && isEditing && editingField === 'budgeted' ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  onBlur={finishEditing}
                  className="w-24 px-2 py-1 text-right border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div 
                  className={`flex items-center ${
                    isSynthetic || !allowEdit
                      ? 'cursor-not-allowed bg-gray-100 px-2 py-1 rounded text-gray-500'
                      : 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors'
                  }`}
                  onClick={() => allowEdit && !isSynthetic && startEditing(item.id, 'budgeted', calculatedBudgeted)}
                >
                  <span className="font-mono">
                    {formatBrazilianNumber(calculatedBudgeted)}
                  </span>
                  {allowEdit && !isSynthetic && (
                    <Edit3 size={12} className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                  {isSynthetic && (
                    <span className="ml-2 text-xs text-gray-400">(auto)</span>
                  )}
                </div>
              )}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right font-mono">
            {formatBrazilianNumber(item.forecast)}
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end">
              {allowEdit && isEditing && editingField === 'actual' ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  onBlur={finishEditing}
                  className="w-24 px-2 py-1 text-right border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div 
                  className={`flex items-center ${
                    isSynthetic || !allowEdit
                      ? 'cursor-not-allowed bg-gray-100 px-2 py-1 rounded text-gray-500'
                      : 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors'
                  }`}
                  onClick={() => allowEdit && !isSynthetic && startEditing(item.id, 'actual', item.actual)}
                >
                  <span className="font-mono">
                    {formatBrazilianNumber(item.actual)}
                  </span>
                  {allowEdit && !isSynthetic && (
                    <Edit3 size={12} className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                  {isSynthetic && (
                    <span className="ml-2 text-xs text-gray-400">(auto)</span>
                  )}
                </div>
              )}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className={`font-mono ${varianceAbs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div>{varianceAbs >= 0 ? '+' : ''}{formatBrazilianNumber(varianceAbs)}</div>
              <div className="text-[10px] opacity-80">{variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%</div>
            </div>
          </td>
        </tr>
        
        {hasChildren && isExpanded && item.subcategories?.map(child => 
          renderBudgetItem(child, level + 1, allowEdit)
        )}
      </React.Fragment>
    );
  };

  const originalData = buildDisplayDataFromRaw();
  const simulatedData = buildDisplayDataFromEditable();

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulador Orçamentário</h1>
        <p className="text-gray-600">Simule cenários e analise margens financeiras</p>
        {/* Dataset switcher */}
        {typeof window !== 'undefined' && (
          <div className="mt-2">
            <label className="text-sm text-gray-600 mr-2">Base:</label>
            <select
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              onChange={(e) => { (dataService as any).setActiveDataset && (dataService as any).setActiveDataset(e.target.value); }}
              defaultValue={(dataService as any).getActiveDatasetName ? (dataService as any).getActiveDatasetName() : ''}
            >
              {(dataService as any).getDatasetNames ? (dataService as any).getDatasetNames().map((n: string) => (
                <option key={n} value={n}>{n}</option>
              )) : null}
            </select>
          </div>
        )}
        {/* Filtros e atividade */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mês:</span>
            <select
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Atividade:</span>
            <div className="flex gap-2">
              <button className={`px-3 py-1.5 rounded border text-sm ${sector==='servicos'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`} onClick={() => setSector('servicos')}>Serviços</button>
              <button className={`px-3 py-1.5 rounded border text-sm ${sector==='comercio'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`} onClick={() => setSector('comercio')}>Comércio</button>
              <button className={`px-3 py-1.5 rounded border text-sm ${sector==='industria'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`} onClick={() => setSector('industria')}>Indústria</button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { localStorage.setItem('simulatorScenario', JSON.stringify({ selectedMonth, sector, cashForecast: saldoPrevisto })); setScenarioSaved(true); }}
              className={`px-4 py-2 rounded text-sm font-medium ${scenarioSaved?'bg-green-600 text-white hover:bg-green-700':'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {scenarioSaved ? 'Cenário Salvo' : 'Salvar Cenário'}
            </button>
          </div>
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Margem Esperada</p>
              <p className="text-2xl font-bold text-blue-900">{expectedMargin.toFixed(1)}%</p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Margem Atual</p>
              <p className="text-2xl font-bold text-green-900">{currentMargin.toFixed(1)}%</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${
          difference >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                difference >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Diferença
              </p>
              <p className={`text-2xl font-bold ${
                difference >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
              </p>
            </div>
            {difference >= 0 ? (
              <TrendingUp className="text-green-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Cards de caixa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${
          saldoAtual >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Saldo de Caixa Atual</p>
          <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-900' : 'text-red-900'}`}>{formatCurrency(saldoAtual)}</p>
          <p className={`text-xs mt-1 ${saldoAtual >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Fonte: Realizado (Saldo Final de Caixa)</p>
        </div>
        <div className={`p-4 rounded-lg border ${
          saldoPrevisto >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${saldoPrevisto >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Saldo de Caixa Previsto (Cenário)</p>
              <p className={`text-2xl font-bold ${saldoPrevisto >= 0 ? 'text-blue-900' : 'text-red-900'}`}>{formatCurrency(saldoPrevisto)}</p>
            </div>
            <TrendingUp className={`${saldoPrevisto >= 0 ? 'text-blue-500' : 'text-red-500'}`} size={24} />
          </div>
          <p className={`text-xs mt-1 ${saldoPrevisto >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Atualiza automaticamente com base nas edições do cenário</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Diferença (Atual - Previsto)</p>
          <p className={`text-2xl font-bold ${saldoAtual - saldoPrevisto >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(saldoAtual - saldoPrevisto)}</p>
        </div>
      </div>

      {/* (Removido) Edição em Massa (Receitas 3.xx) */}

      {/* Budget Tables: Original vs Simulado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cenário Original</h2>
            <p className="text-sm text-gray-600 mt-1">Mesma ordem e agrupamento do fluxo de caixa (somente leitura)</p>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Orçado</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Forecast</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Real</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {originalData.map(item => renderBudgetItem(item, 0, false))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cenário Simulado</h2>
            <p className="text-sm text-gray-600 mt-1">Edite a coluna "Orçado" (analíticas); grupos recalculam automaticamente.</p>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Orçado</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Forecast</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Real</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {simulatedData.map(item => renderBudgetItem(item, 0, true))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={() => {
            // Restaurar dados originais da planilha (voltar ao modo somente leitura)
            setScenarioSaved(false);
            setCashForecast(0);
            localStorage.removeItem('simulatorScenario');
            setEditableBudgetData(dataService.getBudgetData());
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Restaurar Original
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Salvar Cenário
        </button>
      </div>
    </div>
  );
};

export default BudgetSimulator;