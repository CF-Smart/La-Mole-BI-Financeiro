import React from 'react';
import EnhancedKPICard from '../components/KPI/EnhancedKPICard';
import BarChart from '../components/Charts/BarChart';
import SimpleBarChart from '../components/Charts/SimpleBarChart';
import RechartsBar from '../components/Charts/RechartsBar';
import RechartsMultiBar from '../components/Charts/RechartsMultiBar';
import RechartsLine from '../components/Charts/RechartsLine';
import { KPICard } from '../types/financial';
import { dataService } from '../services/dataService';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';

// Empty state component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de performance não disponível</h3>
    <p className="text-gray-500 mb-4">
      Não há dados suficientes para gerar análises de performance.
    </p>
    <p className="text-sm text-blue-600">
      Importe dados de forecast e dados reais para visualizar análises detalhadas.
    </p>
  </div>
);

type FilterOptions = { company?: string; monthIndex?: number | null };

const Performance: React.FC = () => {
  const kpiData = dataService.getKPIData();
  const raw = dataService.getRawImportData();
  const hasRaw = !!raw && raw.length > 2;
  const [selectedMonthIdx, setSelectedMonthIdx] = React.useState<number | null>(null);
  const [kpiView, setKpiView] = React.useState<KPICard[]>(kpiData);

  React.useEffect(() => {
    if (!raw || raw.length <= 2) return;
    const month = selectedMonthIdx != null ? selectedMonthIdx : new Date().getMonth();
    const monthIsAll = selectedMonthIdx == null;
    const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
    const dataStart = Math.max(headerRowIndex + 1, 2);
    const colActual = (m: number) => (isSimplified ? (1 + m) : (2 + (m * 2)));
    const colForecast = (m: number) => (isSimplified ? (1 + m) : (1 + (m * 2)));
    const prevMonth = (m: number) => (m - 1 + 12) % 12;
    const matchCompany = (_name: string) => true; // filtro por empresa cancelado

    const getMonthValActual = (pred: (n: string) => boolean, m: number) => {
      for (let i = dataStart; i < raw.length; i++) {
        const nm = String((raw[i] as any[])[0] || '').trim();
        if (!matchCompany(nm)) continue;
        if (pred(nm.toLowerCase())) {
          return parseCurrencyToNumber((raw[i] as any[])[colActual(m)]);
        }
      }
      return 0;
    };
    const getMonthValForecast = (pred: (n: string) => boolean, m: number) => {
      for (let i = dataStart; i < raw.length; i++) {
        const nm = String((raw[i] as any[])[0] || '').trim();
        if (!matchCompany(nm)) continue;
        if (pred(nm.toLowerCase())) {
          return parseCurrencyToNumber((raw[i] as any[])[colForecast(m)]);
        }
      }
      return 0;
    };
    const getYTDActual = (pred: (n: string) => boolean, m: number) => {
      let sum = 0;
      for (let k = 0; k <= m; k++) sum += getMonthValActual(pred, k);
      return sum;
    };
    const getYTDForecast = (pred: (n: string) => boolean, m: number) => {
      let sum = 0;
      for (let k = 0; k <= m; k++) sum += getMonthValForecast(pred, k);
      return sum;
    };
    const getALLActual = (pred: (n: string) => boolean) => {
      let sum = 0;
      for (let k = 0; k < 12; k++) sum += getMonthValActual(pred, k);
      return sum;
    };
    const getALLForecast = (pred: (n: string) => boolean) => {
      let sum = 0;
      for (let k = 0; k < 12; k++) sum += getMonthValForecast(pred, k);
      return sum;
    };

    const receitaActualNow = (monthIsAll)
      ? getALLActual(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'))
      : getMonthValActual(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'), month);
    const receitaForecastNow = (monthIsAll)
      ? getALLForecast(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'))
      : getMonthValForecast(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'), month);
    const receitaPrev = (monthIsAll)
      ? getALLActual(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'))
      : getMonthValActual(n => n.includes('3.01') || n.includes('receitas de vendas') || n.includes('receita de vendas'), prevMonth(month));

    const cmvNowActualRaw = (monthIsAll)
      ? getALLActual(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')))
      : getMonthValActual(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')), month);
    const cmvNowForecastRaw = (monthIsAll)
      ? getALLForecast(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')))
      : getMonthValForecast(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')), month);
    const cmvPrevRaw = (monthIsAll)
      ? getALLActual(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')))
      : getMonthValActual(n => n.includes('4.01') || (n.includes('despesas com vendas') && n.includes('servi')), prevMonth(month));
    const cmvNow = Math.abs(cmvNowActualRaw);
    const cmvNowForecast = Math.abs(cmvNowForecastRaw);
    const cmvPrev = Math.abs(cmvPrevRaw);

    const saldoNowActual = (monthIsAll)
      ? getALLActual(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'))
      : getMonthValActual(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'), month);
    const saldoNowForecast = (monthIsAll)
      ? getALLForecast(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'))
      : getMonthValForecast(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'), month);
    const saldoPrev = (monthIsAll)
      ? getALLActual(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'))
      : getMonthValActual(n => n.includes('saldo final de caixa') || n === 'saldo final' || n.includes('saldo final líquido'), prevMonth(month));

    const view: KPICard[] = [
      { title: 'Receita Total', forecast: receitaForecastNow, actual: receitaActualNow, previousMonth: receitaPrev, type: 'revenue' },
      { title: 'CMV/CSP/CPV', forecast: cmvNowForecast, actual: cmvNow, previousMonth: cmvPrev, type: 'expense' },
      { title: 'Saldo Final de Caixa', forecast: saldoNowForecast, actual: saldoNowActual, previousMonth: saldoPrev, type: 'balance' },
    ];
    setKpiView(view);
  }, [raw, selectedMonthIdx]);

  // Helpers for summary
  const formatCurrencyBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const findKPI = (name: string) => kpiView.find(k => k.title.toLowerCase().includes(name.toLowerCase()));
  const receita = findKPI('Receita Total');
  const cmv = findKPI('CMV');
  const saldo = findKPI('Saldo Final de Caixa');
  const receitaVar = receita && receita.forecast !== 0 ? ((receita.actual - receita.forecast) / receita.forecast) * 100 : 0;
  const margemOperacional = receita && receita.actual > 0 ? ((receita.actual - (cmv?.actual || 0)) / receita.actual) * 100 : 0;
  const saldoFinalValor = saldo?.actual || 0;


  // Performance insights data
  const performanceInsights = [
    {
      title: 'Receita acima do esperado',
      description: 'Receita atual 3.3% superior ao forecast',
      value: '+R$ 15.000',
      trend: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Despesas controladas',
      description: 'CPV/CMV 2.8% abaixo do orçado',
      value: '-R$ 5.000',
      trend: 'positive',
      icon: Target
    },
    {
      title: 'Margem operacional',
      description: 'Margem 4.2% superior ao mês anterior',
      value: '38.5%',
      trend: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Atenção: Despesas pessoal',
      description: 'Despesas com pessoal 4.8% acima do orçado',
      value: '+R$ 3.000',
      trend: 'negative',
      icon: AlertTriangle
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Financeira</h1>
          <p className="text-gray-600">
            Análise detalhada do desempenho financeiro e comparativo com períodos anteriores
          </p>
          {/* Dataset switcher */}
          {typeof window !== 'undefined' && (
            <div className="mt-3">
              <label className="text-sm text-gray-600 mr-2">Base:</label>
              <select
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                onChange={(e) => { dataService.setActiveDataset(e.target.value); }}
                defaultValue={dataService.getActiveDatasetName() || ''}
              >
                {dataService.getDatasetNames().map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Aviso de dados não importados */}
        {!hasRaw && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-4">
            Sem base importada: exibindo gráficos com dados de exemplo. Importe a planilha para ver seus dados reais.
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mês</label>
            <select
              value={selectedMonthIdx ?? ''}
              onChange={(e) => setSelectedMonthIdx(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {monthNames.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiView.map((kpi, index) => (
            <EnhancedKPICard key={index} data={kpi} />
          ))}
        </div>

        {/* Performance Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Insights de Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      insight.trend === 'positive' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-lg font-bold ${
                      insight.trend === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {insight.value}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Receita (3.01) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evolução da Receita (3.01)</h3>
            <RechartsBar title="Receita 3.01" data={buildRevenueSeries({ monthIndex: selectedMonthIdx })} height={360} />
          </div>

          {/* CMV (4.01) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evolução do CMV (4.01)</h3>
            <RechartsMultiBar
              title="CMV 4.01"
              data={buildMonthlySeriesFromPrefixes(['4.01'], { monthIndex: selectedMonthIdx }).map(d => ({ label: d.month, current: Math.abs(d.current), previous: Math.abs(d.previous) }))}
              height={360}
              show={{ current: true, previous: true, forecast: false }}
              colors={{ current: '#2563eb', previous: '#7c3aed' }}
            />
          </div>
        </div>

        {/* (Removido) Receita: Últimos 3 Meses vs Mesmos Meses de 2024 */}

        {/* Outras séries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Despesas Operacionais 4.03..4.12 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Despesas Operacionais (4.03..4.12)</h3>
            <RechartsMultiBar
              title="Operacionais"
              data={buildMonthlySeriesFromPrefixes(['4.03','4.04','4.05','4.06','4.07','4.08','4.09','4.10','4.11','4.12']).map(d => ({ label: d.month, current: Math.abs(d.current), previous: Math.abs(d.previous) }))}
              height={360}
              show={{ current: true, previous: true, forecast: false }}
              colors={{ current: '#2563eb', previous: '#7c3aed' }}
            />
          </div>
          {/* Investimentos e Empréstimos 5.01 + 5.03 + 6.01 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Investimentos e Empréstimos (5.01 + 5.03 + 6.01)</h3>
            <RechartsMultiBar
              title="Investimentos e Empréstimos"
              data={buildMonthlySeriesFromPrefixes(['5.01','5.03','6.01']).map(d => ({ label: d.month, current: Math.abs(d.current), previous: Math.abs(d.previous) }))}
              height={360}
              show={{ current: true, previous: true, forecast: false }}
              colors={{ current: '#2563eb', previous: '#7c3aed' }}
            />
          </div>
        </div>

        {/* Projeção 6 meses (Saldo Final de Caixa - Previsto) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Projeção dos Próximos 6 Meses (Saldo Final de Caixa • Previsto)</h3>
          <RechartsBar
            title="Projeção 6M (Saldo Previsto)"
            data={buildProjection6M().map(d => ({ label: d.month, value: Math.abs(d.current) }))}
            height={360}
            color="#2563eb"
            barSize={18}
          />
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${receitaVar >= 0 ? 'text-green-600' : 'text-red-600'}`}>{`${receitaVar >= 0 ? '+' : ''}${receitaVar.toFixed(1)}%`}</div>
              <div className="text-sm text-gray-600">Receita vs Forecast</div>
              <div className="text-xs text-gray-500 mt-1">{`${formatCurrencyBRL(receita?.actual || 0)} / ${formatCurrencyBRL(receita?.forecast || 0)}`}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${margemOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>{`${margemOperacional.toFixed(1)}%`}</div>
              <div className="text-sm text-gray-600">Margem Operacional</div>
              <div className="text-xs text-gray-500 mt-1">{`Receita ${formatCurrencyBRL(receita?.actual || 0)} • CMV ${formatCurrencyBRL(cmv?.actual || 0)}`}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">{formatCurrencyBRL(saldoFinalValor)}</div>
              <div className="text-sm text-gray-600">Saldo Final</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
// Helpers
const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\$&');
}

function matchesPrefix(name: string, prefix: string): boolean {
  const n = String(name || '');
  const pattern = new RegExp('(?:^|[\\s\(\-])' + escapeRegex(prefix) + '(?:[\\s\.).-]|$)', 'i');
  return pattern.test(n);
}

function parseCurrencyToNumber(value: any): number {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const kept = s.replace(/[^\d.,-]/g, '');
  const isNeg = kept.includes('-');
  const lastComma = kept.lastIndexOf(',');
  const lastDot = kept.lastIndexOf('.');
  const decimalSep = lastComma > lastDot ? ',' : (lastDot > -1 ? '.' : '');
  let normalized = kept.replace(/-/g, '');
  if (decimalSep) {
    const thousandSep = decimalSep === ',' ? '.' : ',';
    normalized = normalized.split(thousandSep).join('');
    normalized = normalized.replace(decimalSep, '.');
  } else {
    normalized = normalized.replace(/[.,]/g, '');
  }
  let n = parseFloat(normalized);
  if (!isFinite(n) || isNaN(n)) n = 0;
  return isNeg ? -Math.abs(n) : n;
}

function detectHeaderInfo(raw: any[][] | null): { headerRowIndex: number; isSimplified: boolean } {
  if (!raw || raw.length === 0) return { headerRowIndex: 0, isSimplified: true };
  const maxScan = Math.min(5, raw.length);
  let bestIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < maxScan; i++) {
    const row = raw[i] as any[];
    const values = (row || []).map(v => String(v || '').toLowerCase());
    const hasMonths = values.some(v => v.includes('janeiro') || v.includes('fevereiro') || v.includes('março') || v.includes('marco') || v.includes('abril'));
    const hasPrevReal = values.some(v => v.includes('previsto') || v.includes('realizado'));
    const nonEmpty = values.filter(v => v.trim() !== '').length;
    const score = (hasMonths ? 5 : 0) + (hasPrevReal ? 3 : 0) + nonEmpty;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  const header = raw[bestIdx] as any[];
  const values = header.map(v => String(v || '').toLowerCase());
  const hasPrevReal = values.some(v => v.includes('previsto') || v.includes('realizado'));
  const isSimplified = !hasPrevReal || header.length < 27;
  return { headerRowIndex: bestIdx, isSimplified };
}

function buildMonthlySeriesFromPrefixes(prefixes: string[], filter?: FilterOptions): { month: string; current: number; previous: number; forecast: number }[] {
  const raw = dataService.getRawImportData();
  const fallbackActual = dataService.getActualData();
  const result = new Array(12).fill(0);
  const want301 = prefixes.includes('3.01');
  const want401 = prefixes.includes('4.01');
  const wantOperationalRange = prefixes.some(p => /^4\.(0[3-9]|1[0-2])$/.test(p));
  // Revenue aggregation strategy: if there is an explicit 3.01 line or an aggregate total line,
  // include ONLY that aggregate to avoid double counting. Otherwise, sum sublines (diretas/indiretas/faturamento).
  let has301Row = false;
  let hasRevenueAggregateRow = false;
  if (want301 && raw && raw.length > 2) {
    for (let i = 2; i < raw.length; i++) {
      const name = String((raw[i] as any[])[0] || '').trim();
      const n = name.toLowerCase();
      if (matchesPrefix(name, '3.01')) {
        has301Row = true;
      }
      if (
        (
          n.includes('receitas de vendas e de serviços') ||
          n.includes('receitas de vendas e serviços') ||
          n === 'receitas de vendas' ||
          n.includes('receita de vendas') ||
          n.includes('total de recebimentos') ||
          n.includes('total recebimentos') ||
          n.includes('total de recebimento') ||
          n.includes('total recebimento')
        ) &&
        !n.includes('direta') &&
        !n.includes('indireta')
      ) {
        hasRevenueAggregateRow = true;
      }
    }
  }
  const altTerms = (name: string) => {
    const n = String(name || '').toLowerCase();
    if (want301) {
      if (has301Row || hasRevenueAggregateRow) {
        // Prefer only aggregate row to avoid double counting
        return (
          n.includes('receitas de vendas e de serviços') ||
          n.includes('receitas de vendas e serviços') ||
          (n.includes('receita de vendas') && !n.includes('direta') && !n.includes('indireta')) ||
          (n === 'receitas de vendas') ||
          n.includes('total de recebimentos') ||
          n.includes('total recebimentos') ||
          n.includes('total de recebimento') ||
          n.includes('total recebimento')
        );
      }
      // Fallback: sum sublines if aggregate is absent
      return (
        n.includes('faturamento') ||
        n.includes('receitas diretas') ||
        n.includes('receita direta') ||
        n.includes('receitas indiretas') ||
        n.includes('receita indireta')
      );
    }
    if (want401) {
      return (
        n.includes('cpv') ||
        n.includes('cmv') ||
        n.includes('csp') ||
        n.includes('custo dos produtos vendidos') ||
        n.includes('custo das mercadorias vendidas') ||
        n.includes('custo de mercadorias vendidas') ||
        n.includes('custo dos serviços prestados') ||
        n.includes('custo de serviços prestados') ||
        n.includes('custo com vendas') ||
        n.includes('custo com servico') ||
        n.includes('custo com serviço') ||
        n.includes('custo com serviços') ||
        (n.includes('despesas com vendas') && (n.includes('servico') || n.includes('serviço') || n.includes('serviços')))
      );
    }
    if (wantOperationalRange) {
      return (
        n.includes('despesa com pessoal') ||
        n.includes('despesas com pessoal') ||
        n.includes('despesas diretas') ||
        n.includes('despesas administrativas') ||
        n.includes('despesas com funcionamento') ||
        n.includes('despesas comerciais') ||
        n.includes('despesas financeiras') ||
        n.includes('despesa com pessoal – indireto') ||
        n.includes('despesa com pessoal - indireto') ||
        n.includes('despesas financeiras – variáveis') ||
        n.includes('despesas financeiras - variáveis') ||
        n.includes('despesas financeiras - variaveis') ||
        n.includes('despesas financeiras variáveis') ||
        n.includes('despesas financeiras variaveis')
      );
    }
    if (prefixes.some(p => ['5.01','5.03','6.01'].includes(p))) {
      return (
        n.includes('investimento') ||
        n.includes('capex') ||
        n.includes('imobilizado') ||
        n.includes('emprést') ||
        n.includes('emprest') ||
        n.includes('financiamento') ||
        n.includes('amortização de emprést') ||
        n.includes('amortizacao de emprest')
      );
    }
    return false;
  };
  if (raw && raw.length > 2) {
    const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
    const dataStart = Math.max(headerRowIndex + 1, 2);
    for (let m = 0; m < 12; m++) {
      if (filter?.monthIndex != null && m !== filter.monthIndex) { result[m] = 0; continue; }
      const actualColIndex = isSimplified ? (1 + m) : (2 + (m * 2));
      let sum = 0;
      for (let i = dataStart; i < raw.length; i++) {
        const row = raw[i] as any[];
        const name = String(row[0] || '').trim();
        const includeCompany = !filter?.company || name.toLowerCase().includes(filter.company.toLowerCase());
        if (includeCompany && (prefixes.some(p => matchesPrefix(name, p)) || altTerms(name))) {
          sum += parseCurrencyToNumber(row[actualColIndex]);
        }
      }
      result[m] = sum;
    }
  } else if (fallbackActual && fallbackActual.length > 0) {
    // Fallback usando dados de exemplo (mockData -> actualData)
    const monthKeys = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    for (let m = 0; m < 12; m++) {
      if (filter?.monthIndex != null && m !== filter.monthIndex) { result[m] = 0; continue; }
      let sum = 0;
      for (const item of fallbackActual as any[]) {
        const name = String(item.category || '').trim();
        const includeCompany = !filter?.company || name.toLowerCase().includes(filter.company.toLowerCase());
        if (includeCompany && (prefixes.some(p => matchesPrefix(name, p)) || altTerms(name))) {
          const v = Number(item[monthKeys[m]] || 0);
          if (Number.isFinite(v)) sum += v;
        }
      }
      result[m] = sum;
    }
  } else {
    // Fallback 2: usar budgetData agregado por código (apenas mês atual disponível)
    const budget = dataService.getBudgetData?.() as any[] | undefined;
    if (budget && budget.length > 0) {
      const currentMonthIndex = new Date().getMonth();
      const stack: any[] = [...budget];
      let sum = 0;
      while (stack.length) {
        const it = stack.pop();
        const code = String(it.code || '');
        const name = String(it.category || '');
        if (prefixes.some(p => matchesPrefix(code, p)) || prefixes.some(p => matchesPrefix(name, p)) || altTerms(name)) {
          const v = Number(it.actual || 0);
          if (Number.isFinite(v)) sum += v;
        }
        if (it.subcategories && Array.isArray(it.subcategories)) {
          for (const child of it.subcategories) stack.push(child);
        }
      }
      result.fill(0);
      result[currentMonthIndex] = sum;
    }
  }
  const hasAny = result.some(v => Math.abs(v) > 0);
  const safe = hasAny ? result : new Array(12).fill(0);
  // previous = bimestre anterior (soma dos dois meses anteriores)
  const previousBi = safe.map((_, i) => {
    const a = i - 1 >= 0 ? safe[i - 1] : 0;
    const b = i - 2 >= 0 ? safe[i - 2] : 0;
    return a + b;
  });
  return monthNames.map((m, i) => ({ month: m, current: safe[i] || 0, previous: previousBi[i] || 0, forecast: 0 }));
}

function buildProjection6M(): { month: string; current: number; previous: number; forecast: number }[] {
  const raw = dataService.getRawImportData();
  const fallbackForecast = dataService.getForecastData?.() as any[] | undefined;
  const startMonth = new Date().getMonth();
  const series: { month: string; current: number; previous: number; forecast: number }[] = [];
  if (!raw || raw.length <= 2) {
    // Fallback: usar mock de forecast se existir
    if (fallbackForecast && fallbackForecast.length > 0) {
      for (let k = 0; k < 6; k++) {
        const m = (startMonth + k) % 12;
        const monthLabel = monthNames[m];
        // Heurística: saldo final previsto ~ receitas - despesas acumuladas do mock
        let receita = 0;
        let despesa = 0;
        for (const row of fallbackForecast) {
          const cat = String(row.category || '').toLowerCase();
          const keyMap: Record<number,string> = {0:'january',1:'february',2:'march',3:'april',4:'may',5:'june',6:'july',7:'august',8:'september',9:'october',10:'november',11:'december'};
          const v = Number(row[keyMap[m]] || 0);
          if (!Number.isFinite(v)) continue;
          if (cat.includes('receita')) receita += v;
          if (cat.includes('despesa') || cat.includes('custo') || cat.includes('cpv') || cat.includes('cmv') || cat.includes('csp')) despesa += Math.abs(v);
        }
        const saldo = receita - despesa;
        series.push({ month: monthLabel, current: saldo, previous: 0, forecast: 0 });
      }
      return series;
    }
    for (let k = 0; k < 6; k++) series.push({ month: monthNames[(startMonth + k) % 12], current: 0, previous: 0, forecast: 0 });
    return series;
  }
  for (let k = 0; k < 6; k++) {
    const m = (startMonth + k) % 12;
    const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
    const dataStart = Math.max(headerRowIndex + 1, 2);
    const forecastColIndex = isSimplified ? (1 + m) : (1 + (m * 2));
    let val = 0;
    for (let i = dataStart; i < raw.length; i++) {
      const row = raw[i] as any[];
      const name = String(row[0] || '').trim().toLowerCase();
      if (name.includes('saldo final de caixa') || name === 'saldo final' || name.includes('saldo final líquido')) {
        val = parseCurrencyToNumber(row[forecastColIndex]);
        break;
      }
    }
    series.push({ month: monthNames[m], current: val, previous: 0, forecast: 0 });
  }
  return series;
}

function buildRevenueCurrentVsLast3M(): { month: string; current: number; previous: number; forecast: number }[] {
  const raw = dataService.getRawImportData();
  const monthIndexNow = new Date().getMonth();
  const series: { month: string; current: number; previous: number; forecast: number }[] = [];
  // Saída: um único ponto (mês atual) com duas barras: current=receita do mês, previous=soma últimos 3 meses
  if (!raw || raw.length <= 2) {
    return [{ month: monthNames[monthIndexNow], current: 0, previous: 0, forecast: 0 }];
  }
  const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
  const dataStart = Math.max(headerRowIndex + 1, 2);
  const getColIndex = (m: number, kind: 'forecast' | 'actual') => {
    if (isSimplified) return 1 + m; // única coluna por mês
    return kind === 'actual' ? (2 + (m * 2)) : (1 + (m * 2));
  };
  // Encontrar linha 3.01 (ou agregada de receita) priorizando agregada
  let rowIdx: number | null = null;
  let aggIdx: number | null = null;
  for (let i = dataStart; i < raw.length; i++) {
    const name = String((raw[i] as any[])[0] || '').trim();
    const n = name.toLowerCase();
    if (matchesPrefix(name, '3.01')) rowIdx = i;
    if (
      (n.includes('receitas de vendas e de serviços') ||
       n.includes('receitas de vendas e serviços') ||
       n === 'receitas de vendas' ||
       n.includes('receita de vendas')) &&
      !n.includes('direta') && !n.includes('indireta')
    ) {
      aggIdx = i;
    }
  }
  const useIdx = aggIdx ?? rowIdx;
  if (useIdx == null) {
    return [{ month: monthNames[monthIndexNow], current: 0, previous: 0, forecast: 0 }];
  }
  const row = raw[useIdx] as any[];
  const currentVal = parseCurrencyToNumber(row[getColIndex(monthIndexNow, 'actual')]);
  let last3Sum = 0;
  for (let k = 1; k <= 3; k++) {
    const m = (monthIndexNow - k + 12) % 12;
    last3Sum += parseCurrencyToNumber(row[getColIndex(m, 'actual')]);
  }
  series.push({ month: monthNames[monthIndexNow], current: currentVal, previous: last3Sum, forecast: 0 });
  return series;
}

function buildRevenueSeries(filter?: FilterOptions): { label: string; value: number }[] {
  const raw = dataService.getRawImportData();
  const labels = monthNames;
  const series: { label: string; value: number }[] = [];
  if (!raw || raw.length <= 2) {
    return labels.map(l => ({ label: l, value: 0 }));
  }
  const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
  const dataStart = Math.max(headerRowIndex + 1, 2);
  const getActualCol = (m: number) => (isSimplified ? (1 + m) : (2 + (m * 2)));
  // Encontre linha agregada 3.01 ou Total de Recebimentos
  let useIdx: number | null = null;
  for (let i = dataStart; i < raw.length; i++) {
    const name = String((raw[i] as any[])[0] || '').trim();
    const n = name.toLowerCase();
    if (matchesPrefix(name, '3.01')) useIdx = i;
    if (
      (n.includes('receitas de vendas e de serviços') ||
       n.includes('receitas de vendas e serviços') ||
       n === 'receitas de vendas' ||
       n.includes('receita de vendas') ||
       n.includes('total de recebimentos') ||
       n.includes('total recebimentos') ||
       n.includes('total de recebimento') ||
       n.includes('total recebimento')) &&
      !n.includes('direta') && !n.includes('indireta')
    ) {
      useIdx = i;
    }
  }
  if (useIdx == null) return labels.map(l => ({ label: l, value: 0 }));
  const row = raw[useIdx] as any[];
  for (let m = 0; m < 12; m++) {
    if (filter?.monthIndex != null && m !== filter.monthIndex) { series.push({ label: labels[m], value: 0 }); continue; }
    const val = parseCurrencyToNumber(row[getActualCol(m)]);
    series.push({ label: labels[m], value: val });
  }
  return series;
}

function buildRevenueLast3Mvs2024(filter?: FilterOptions, yearForPrevious?: number): { label: string; current: number; previous: number; forecast?: number }[] {
  const raw = dataService.getRawImportData();
  const now = new Date();
  const currentYear = now.getFullYear();
  const last3 = [2,1,0].map(k => (now.getMonth() - k + 12) % 12);
  const labels = last3.map(m => monthNames[m]);

  if (!raw || raw.length <= 2) {
    return labels.map(l => ({ label: l, current: 0, previous: 0 }));
  }
  const { headerRowIndex, isSimplified } = detectHeaderInfo(raw);
  const dataStart = Math.max(headerRowIndex + 1, 2);
  const colFor = (year: number, m: number) => {
    // Estrutura importada não traz ano múltiplo no mesmo arquivo; assumimos que a planilha atual é do ano corrente
    // Para 2024, usamos a mesma coluna do mês (fallback) — se houver um arquivo específico de 2024, este método deve ser adaptado
    return isSimplified ? (1 + m) : (2 + (m * 2));
  };
  let rowIdx: number | null = null;
  for (let i = dataStart; i < raw.length; i++) {
    const name = String((raw[i] as any[])[0] || '').trim();
    if (matchesPrefix(name, '3.01')) { rowIdx = i; break; }
    const n = name.toLowerCase();
    const includeCompany = !filter?.company || n.includes(filter.company.toLowerCase());
    if (includeCompany && (n.includes('receitas de vendas e de serviços') || n.includes('receitas de vendas') || n.includes('receita de vendas')) && !n.includes('direta') && !n.includes('indireta')) {
      rowIdx = i; break;
    }
  }
  if (rowIdx == null) return labels.map(l => ({ label: l, current: 0, previous: 0 }));

  const row = raw[rowIdx] as any[];
  if (!yearForPrevious) {
    // 'Todos' → soma de todos até o momento (YTD) para cada um dos últimos 3 meses
    const ytdFor = (m: number) => {
      let sum = 0;
      for (let k = 0; k <= m; k++) sum += parseCurrencyToNumber(row[colFor(currentYear, k)]);
      return sum;
    };
    return last3.map(m => ({
      label: monthNames[m],
      current: parseCurrencyToNumber(row[colFor(currentYear, m)]),
      previous: ytdFor(m),
    }));
  }
  return last3.map(m => ({
    label: monthNames[m],
    current: parseCurrencyToNumber(row[colFor(currentYear, m)]),
    previous: parseCurrencyToNumber(row[colFor(yearForPrevious, m)]),
  }));
}