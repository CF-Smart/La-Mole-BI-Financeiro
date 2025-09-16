import { KPICard, BudgetItem, ChartData } from '../types/financial';
import { dataService } from '../services/dataService';

export const kpiData: KPICard[] = [
  {
    title: 'Saldo Inicial',
    forecast: 150000,
    actual: 145000,
    previousMonth: 140000,
    type: 'balance'
  },
  {
    title: 'Receita Total',
    forecast: 450000,
    actual: 465000,
    previousMonth: 440000,
    type: 'revenue'
  },
  {
    title: 'CPV/CMV/CSP',
    forecast: 180000,
    actual: 175000,
    previousMonth: 185000,
    type: 'expense'
  },
  {
    title: 'Despesas Operacionais',
    forecast: 120000,
    actual: 126000,
    previousMonth: 115000,
    type: 'expense'
  },
  {
    title: 'Despesas Não Operacionais',
    forecast: 25000,
    actual: 23000,
    previousMonth: 28000,
    type: 'expense'
  },
  {
    title: 'Saldo Final',
    forecast: 275000,
    actual: 286000,
    previousMonth: 252000,
    type: 'balance'
  }
];

export const chartData: ChartData[] = [
  { month: 'Jan', current: 420000, previous: 380000, forecast: 450000 },
  { month: 'Fev', current: 445000, previous: 410000, forecast: 460000 },
  { month: 'Mar', current: 465000, previous: 425000, forecast: 450000 }
];

// Forecast data for next 6 months
export const forecastData = [
  { month: 'Abr', revenue: 480000, expenses: 320000, balance: 305000 },
  { month: 'Mai', revenue: 495000, expenses: 330000, balance: 470000 },
  { month: 'Jun', revenue: 510000, expenses: 340000, balance: 640000 },
  { month: 'Jul', revenue: 525000, expenses: 350000, balance: 815000 },
  { month: 'Ago', revenue: 540000, expenses: 360000, balance: 995000 },
  { month: 'Set', revenue: 555000, expenses: 370000, balance: 1180000 }
];

// Enhanced budget data with subcategories and historical data
const createBudgetItem = (
  id: string,
  code: string,
  category: string,
  type: 'revenue' | 'expense' | 'balance',
  actual: number,
  forecast: number,
  budgeted: number,
  accountType: 'synthetic' | 'analytical' = 'analytical',
  level: number = 1,
  parentCode?: string,
  subcategories?: BudgetItem[]
): BudgetItem => ({
  id,
  code,
  category,
  type,
  actual,
  forecast,
  budgeted,
  accountType,
  level,
  parentCode,
  subcategories
});

// Current month budget data with subcategories
const currentMonthBudget: BudgetItem[] = [
  createBudgetItem('balance-initial', '1.00', 'SALDO INICIAL', 'balance', 145000, 150000, 150000, 'synthetic', 0),
  
  createBudgetItem('revenue-total', '3.01', 'RECEITAS', 'revenue', 465000, 450000, 460000, 'synthetic', 0, undefined, [
    createBudgetItem('revenue-direct', '3.01.01', 'Receitas Diretas', 'revenue', 380000, 370000, 375000, 'analytical', 1, '3.01'),
    createBudgetItem('revenue-indirect', '3.01.02', 'Receitas Indiretas', 'revenue', 85000, 80000, 85000, 'analytical', 1, '3.01')
  ]),
  
  createBudgetItem('expenses-operational', '4.01', 'DESPESAS OPERACIONAIS', 'expense', 301000, 300000, 295000, 'synthetic', 0, undefined, [
    createBudgetItem('cpv-cmv-csp', '4.01.01', 'CPV/CMV/CSP', 'expense', 175000, 180000, 175000, 'analytical', 1, '4.01'),
    createBudgetItem('commercial-expenses', '4.01.02', 'Despesas Comerciais', 'expense', 45000, 42000, 44000, 'analytical', 1, '4.01'),
    createBudgetItem('personnel-expenses', '4.01.03', 'Despesas com Pessoal', 'expense', 65000, 62000, 60000, 'analytical', 1, '4.01'),
    createBudgetItem('administrative-expenses', '4.01.04', 'Despesas Administrativas', 'expense', 16000, 16000, 16000, 'analytical', 1, '4.01')
  ]),
  
  createBudgetItem('expenses-non-operational', '4.02', 'NÃO OPERACIONAIS', 'expense', 38000, 35000, 40000, 'synthetic', 0, undefined, [
    createBudgetItem('financial-revenue', '4.02.01', 'Receita Financeira', 'revenue', 8000, 10000, 12000, 'analytical', 1, '4.02'),
    createBudgetItem('financial-expenses', '4.02.02', 'Despesas Financeiras', 'expense', 18000, 15000, 20000, 'analytical', 1, '4.02'),
    createBudgetItem('other-expenses', '4.02.03', 'Outras Despesas', 'expense', 5000, 10000, 8000, 'analytical', 1, '4.02'),
    createBudgetItem('investments', '4.02.04', 'Investimentos', 'expense', 23000, 20000, 24000, 'analytical', 1, '4.02')
  ]),
  
  createBudgetItem('balance-before-distribution', '2.01', 'SALDO ANTES DA DISTRIBUIÇÃO DE LUCROS', 'balance', 279000, 275000, 287000, 'synthetic', 0),
  createBudgetItem('profit-distribution', '2.02', 'Distribuição de Lucros', 'expense', 50000, 45000, 50000, 'analytical', 0),
  createBudgetItem('balance-final', '2.03', 'SALDO FINAL LÍQUIDO (CAIXA)', 'balance', 229000, 230000, 237000, 'synthetic', 0)
];

// Previous month 1 (February)
const previousMonth1Budget: BudgetItem[] = [
  createBudgetItem('balance-initial', '1.00', 'SALDO INICIAL', 'balance', 140000, 145000, 145000, 'synthetic', 0),
  
  createBudgetItem('revenue-total', '3.01', 'RECEITAS', 'revenue', 445000, 460000, 450000, 'synthetic', 0, undefined, [
    createBudgetItem('revenue-direct', '3.01.01', 'Receitas Diretas', 'revenue', 365000, 380000, 370000, 'analytical', 1, '3.01'),
    createBudgetItem('revenue-indirect', '3.01.02', 'Receitas Indiretas', 'revenue', 80000, 80000, 80000, 'analytical', 1, '3.01')
  ]),
  
  createBudgetItem('expenses-operational', '4.01', 'DESPESAS OPERACIONAIS', 'expense', 285000, 295000, 290000, 'synthetic', 0, undefined, [
    createBudgetItem('cpv-cmv-csp', '4.01.01', 'CPV/CMV/CSP', 'expense', 165000, 175000, 170000, 'analytical', 1, '4.01'),
    createBudgetItem('commercial-expenses', '4.01.02', 'Despesas Comerciais', 'expense', 42000, 40000, 42000, 'analytical', 1, '4.01'),
    createBudgetItem('personnel-expenses', '4.01.03', 'Despesas com Pessoal', 'expense', 62000, 60000, 58000, 'analytical', 1, '4.01'),
    createBudgetItem('administrative-expenses', '4.01.04', 'Despesas Administrativas', 'expense', 16000, 20000, 20000, 'analytical', 1, '4.01')
  ]),
  
  createBudgetItem('expenses-non-operational', '4.02', 'NÃO OPERACIONAIS', 'expense', 35000, 40000, 38000, 'synthetic', 0, undefined, [
    createBudgetItem('financial-revenue', '4.02.01', 'Receita Financeira', 'revenue', 7000, 8000, 10000, 'analytical', 1, '4.02'),
    createBudgetItem('financial-expenses', '4.02.02', 'Despesas Financeiras', 'expense', 15000, 18000, 18000, 'analytical', 1, '4.02'),
    createBudgetItem('other-expenses', '4.02.03', 'Outras Despesas', 'expense', 8000, 12000, 10000, 'analytical', 1, '4.02'),
    createBudgetItem('investments', '4.02.04', 'Investimentos', 'expense', 19000, 18000, 20000, 'analytical', 1, '4.02')
  ]),
  
  createBudgetItem('balance-before-distribution', '2.01', 'SALDO ANTES DA DISTRIBUIÇÃO DE LUCROS', 'balance', 265000, 270000, 267000, 'synthetic', 0),
  createBudgetItem('profit-distribution', '2.02', 'Distribuição de Lucros', 'expense', 45000, 40000, 45000, 'analytical', 0),
  createBudgetItem('balance-final', '2.03', 'SALDO FINAL LÍQUIDO (CAIXA)', 'balance', 220000, 230000, 222000, 'synthetic', 0)
];

// Previous month 2 (January)
const previousMonth2Budget: BudgetItem[] = [
  createBudgetItem('balance-initial', '1.00', 'SALDO INICIAL', 'balance', 135000, 140000, 140000, 'synthetic', 0),
  
  createBudgetItem('revenue-total', '3.01', 'RECEITAS', 'revenue', 420000, 450000, 440000, 'synthetic', 0, undefined, [
    createBudgetItem('revenue-direct', '3.01.01', 'Receitas Diretas', 'revenue', 350000, 370000, 360000, 'analytical', 1, '3.01'),
    createBudgetItem('revenue-indirect', '3.01.02', 'Receitas Indiretas', 'revenue', 70000, 80000, 80000, 'analytical', 1, '3.01')
  ]),
  
  createBudgetItem('expenses-operational', '4.01', 'DESPESAS OPERACIONAIS', 'expense', 275000, 285000, 280000, 'synthetic', 0, undefined, [
    createBudgetItem('cpv-cmv-csp', '4.01.01', 'CPV/CMV/CSP', 'expense', 160000, 170000, 165000, 'analytical', 1, '4.01'),
    createBudgetItem('commercial-expenses', '4.01.02', 'Despesas Comerciais', 'expense', 40000, 38000, 40000, 'analytical', 1, '4.01'),
    createBudgetItem('personnel-expenses', '4.01.03', 'Despesas com Pessoal', 'expense', 60000, 58000, 56000, 'analytical', 1, '4.01'),
    createBudgetItem('administrative-expenses', '4.01.04', 'Despesas Administrativas', 'expense', 15000, 19000, 19000, 'analytical', 1, '4.01')
  ]),
  
  createBudgetItem('expenses-non-operational', '4.02', 'NÃO OPERACIONAIS', 'expense', 32000, 38000, 35000, 'synthetic', 0, undefined, [
    createBudgetItem('financial-revenue', '4.02.01', 'Receita Financeira', 'revenue', 5000, 6000, 8000, 'analytical', 1, '4.02'),
    createBudgetItem('financial-expenses', '4.02.02', 'Despesas Financeiras', 'expense', 12000, 16000, 15000, 'analytical', 1, '4.02'),
    createBudgetItem('other-expenses', '4.02.03', 'Outras Despesas', 'expense', 10000, 14000, 12000, 'analytical', 1, '4.02'),
    createBudgetItem('investments', '4.02.04', 'Investimentos', 'expense', 15000, 14000, 16000, 'analytical', 1, '4.02')
  ]),
  
  createBudgetItem('balance-before-distribution', '2.01', 'SALDO ANTES DA DISTRIBUIÇÃO DE LUCROS', 'balance', 248000, 267000, 265000, 'synthetic', 0),
  createBudgetItem('profit-distribution', '2.02', 'Distribuição de Lucros', 'expense', 40000, 35000, 40000, 'analytical', 0),
  createBudgetItem('balance-final', '2.03', 'SALDO FINAL LÍQUIDO (CAIXA)', 'balance', 208000, 232000, 225000, 'synthetic', 0)
];

export const budgetDataWithHistory = {
  currentMonth: currentMonthBudget,
  previousMonth1: previousMonth1Budget,
  previousMonth2: previousMonth2Budget
};

export const budgetData: BudgetItem[] = currentMonthBudget;

// Load sample data into the data service
export const loadSampleData = () => {
  // Sample Chart of Accounts
  const sampleChartOfAccounts = [
    {
      id: 'synthetic-1',
      code: '01',
      name: 'Grupo 01 - Receitas',
      type: 'synthetic' as const,
      level: 0,
      children: [
        {
          id: 'analytical-1',
          code: '01.01',
          name: 'Receitas Diretas',
          type: 'analytical' as const,
          parentId: 'synthetic-1',
          level: 1
        },
        {
          id: 'analytical-2',
          code: '01.02',
          name: 'Receitas Indiretas',
          type: 'analytical' as const,
          parentId: 'synthetic-1',
          level: 1
        }
      ]
    },
    {
      id: 'synthetic-2',
      code: '02',
      name: 'Grupo 02 - Custos',
      type: 'synthetic' as const,
      level: 0,
      children: [
        {
          id: 'analytical-3',
          code: '02.01',
          name: 'CPV/CMV/CSP',
          type: 'analytical' as const,
          parentId: 'synthetic-2',
          level: 1
        }
      ]
    },
    {
      id: 'synthetic-3',
      code: '03',
      name: 'Grupo 03 - Despesas Operacionais',
      type: 'synthetic' as const,
      level: 0,
      children: [
        {
          id: 'analytical-4',
          code: '03.01',
          name: 'Despesas Comerciais',
          type: 'analytical' as const,
          parentId: 'synthetic-3',
          level: 1
        },
        {
          id: 'analytical-5',
          code: '03.02',
          name: 'Despesas com Pessoal',
          type: 'analytical' as const,
          parentId: 'synthetic-3',
          level: 1
        },
        {
          id: 'analytical-6',
          code: '03.03',
          name: 'Despesas Administrativas',
          type: 'analytical' as const,
          parentId: 'synthetic-3',
          level: 1
        }
      ]
    },
    {
      id: 'synthetic-4',
      code: '04',
      name: 'Grupo 04 - Não Operacionais',
      type: 'synthetic' as const,
      level: 0,
      children: [
        {
          id: 'analytical-7',
          code: '04.01',
          name: 'Receita Financeira',
          type: 'analytical' as const,
          parentId: 'synthetic-4',
          level: 1
        },
        {
          id: 'analytical-8',
          code: '04.02',
          name: 'Despesas Financeiras',
          type: 'analytical' as const,
          parentId: 'synthetic-4',
          level: 1
        },
        {
          id: 'analytical-9',
          code: '04.03',
          name: 'Outras Despesas',
          type: 'analytical' as const,
          parentId: 'synthetic-4',
          level: 1
        },
        {
          id: 'analytical-10',
          code: '04.04',
          name: 'Investimentos',
          type: 'analytical' as const,
          parentId: 'synthetic-4',
          level: 1
        }
      ]
    }
  ];

  // Sample Forecast Data
  const sampleForecastData = [
    {
      category: 'Receitas Diretas',
      january: 380000,
      february: 390000,
      march: 370000,
      april: 400000,
      may: 420000,
      june: 440000,
      july: 460000,
      august: 450000,
      september: 430000,
      october: 410000,
      november: 390000,
      december: 400000,
      total: 4940000
    },
    {
      category: 'Receitas Indiretas',
      january: 85000,
      february: 88000,
      march: 80000,
      april: 92000,
      may: 95000,
      june: 98000,
      july: 102000,
      august: 100000,
      september: 96000,
      october: 90000,
      november: 85000,
      december: 89000,
      total: 1100000
    },
    {
      category: 'CPV/CMV/CSP',
      january: -175000,
      february: -180000,
      march: -170000,
      april: -185000,
      may: -190000,
      june: -195000,
      july: -200000,
      august: -195000,
      september: -185000,
      october: -180000,
      november: -175000,
      december: -180000,
      total: -2210000
    },
    {
      category: 'Despesas Comerciais',
      january: -42000,
      february: -44000,
      march: -40000,
      april: -46000,
      may: -48000,
      june: -50000,
      july: -52000,
      august: -50000,
      september: -48000,
      october: -45000,
      november: -42000,
      december: -44000,
      total: -551000
    },
    {
      category: 'Despesas com Pessoal',
      january: -62000,
      february: -64000,
      march: -60000,
      april: -66000,
      may: -68000,
      june: -70000,
      july: -72000,
      august: -70000,
      september: -68000,
      october: -65000,
      november: -62000,
      december: -64000,
      total: -791000
    },
    {
      category: 'Despesas Administrativas',
      january: -16000,
      february: -17000,
      march: -15000,
      april: -18000,
      may: -19000,
      june: -20000,
      july: -21000,
      august: -20000,
      september: -19000,
      october: -17000,
      november: -16000,
      december: -17000,
      total: -215000
    },
    {
      category: 'Receita Financeira',
      january: 10000,
      february: 11000,
      march: 9000,
      april: 12000,
      may: 13000,
      june: 14000,
      july: 15000,
      august: 14000,
      september: 13000,
      october: 11000,
      november: 10000,
      december: 11000,
      total: 143000
    },
    {
      category: 'Despesas Financeiras',
      january: -15000,
      february: -16000,
      march: -14000,
      april: -17000,
      may: -18000,
      june: -19000,
      july: -20000,
      august: -19000,
      september: -18000,
      october: -16000,
      november: -15000,
      december: -16000,
      total: -203000
    },
    {
      category: 'Outras Despesas',
      january: -10000,
      february: -11000,
      march: -9000,
      april: -12000,
      may: -13000,
      june: -14000,
      july: -15000,
      august: -14000,
      september: -13000,
      october: -11000,
      november: -10000,
      december: -11000,
      total: -143000
    },
    {
      category: 'Investimentos',
      january: -20000,
      february: -22000,
      march: -18000,
      april: -24000,
      may: -26000,
      june: -28000,
      july: -30000,
      august: -28000,
      september: -26000,
      october: -22000,
      november: -20000,
      december: -22000,
      total: -286000
    }
  ];

  // Sample Actual Data
  const sampleActualData = [
    {
      category: 'Receitas Diretas',
      january: 385000,
      february: 395000,
      march: 375000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 1155000
    },
    {
      category: 'Receitas Indiretas',
      january: 87000,
      february: 90000,
      march: 82000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 259000
    },
    {
      category: 'CPV/CMV/CSP',
      january: -170000,
      february: -175000,
      march: -165000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -510000
    },
    {
      category: 'Despesas Comerciais',
      january: -40000,
      february: -42000,
      march: -38000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -120000
    },
    {
      category: 'Despesas com Pessoal',
      january: -60000,
      february: -62000,
      march: -58000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -180000
    },
    {
      category: 'Despesas Administrativas',
      january: -15000,
      february: -16000,
      march: -14000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -45000
    },
    {
      category: 'Receita Financeira',
      january: 8000,
      february: 9000,
      march: 7000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 24000
    },
    {
      category: 'Despesas Financeiras',
      january: -12000,
      february: -14000,
      march: -11000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -37000
    },
    {
      category: 'Outras Despesas',
      january: -8000,
      february: -9000,
      march: -7000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -24000
    },
    {
      category: 'Investimentos',
      january: -18000,
      february: -20000,
      march: -16000,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: -54000
    }
  ];

  // Load data into the service
  const service = dataService;
  service.setChartOfAccounts(sampleChartOfAccounts);
  service.setForecastData(sampleForecastData);
  service.setActualData(sampleActualData);
  service.setKPIData(kpiData);
  service.setBudgetData(budgetData);

  // Add sample import history
  service.addImportHistory({
    id: 'sample-database-1',
    type: 'database',
    fileName: 'base-dados-conta-azul.xlsx',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'success',
    recordCount: 25
  });

  console.log('✅ Sample data loaded successfully!');
};

const downloadTemplate = (template: string) => {
  if (template === 'template-conta-azul.xlsx') {
    // Create CSV content for template with correct row structure
    const header = [
      'Categorias',
      'Janeiro Previsto', 'Janeiro Realizado',
      'Fevereiro Previsto', 'Fevereiro Realizado',
      'Março Previsto', 'Março Realizado',
      'Abril Previsto', 'Abril Realizado',
      'Maio Previsto', 'Maio Realizado',
      'Junho Previsto', 'Junho Realizado',
      'Julho Previsto', 'Julho Realizado',
      'Agosto Previsto', 'Agosto Realizado',
      'Setembro Previsto', 'Setembro Realizado',
      'Outubro Previsto', 'Outubro Realizado',
      'Novembro Previsto', 'Novembro Realizado',
      'Dezembro Previsto', 'Dezembro Realizado',
      'Previsto', 'Realizado'
    ];
    
    const csvContent = [
      header.join(','),
      '', // Row 2 - may be empty or contain additional info
      'Receita de Vendas,50000,48000,52000,50000,48000,46000,55000,53000,58000,56000,60000,58000,62000,60000,59000,57000,57000,55000,54000,52000,51000,49000,53000,51000,0,0',
      'Receita de Serviços,25000,24000,26000,25000,24000,23000,27000,26000,28000,27000,30000,29000,31000,30000,29000,28000,28000,27000,27000,26000,25000,24000,26000,25000,0,0',
      'Custo dos Produtos Vendidos,20000,21000,21000,22000,19000,20000,22000,23000,23000,24000,24000,25000,25000,26000,24000,25000,23000,24000,22000,23000,20000,21000,21000,22000,0,0',
      'Despesas com Pessoal,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,0,0'
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-financeiro.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // For other templates, show a message
    alert(`Template ${template} will be available soon.`);
  }
};