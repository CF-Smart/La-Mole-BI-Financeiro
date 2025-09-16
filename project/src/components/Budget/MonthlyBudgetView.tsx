import { KPICard, BudgetItem, BusinessType, ChartData, FinancialAccount } from '../types/financial';

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
    forecast: 500000,
    actual: 485000,
    previousMonth: 460000,
    type: 'revenue'
  },
  {
    title: 'CPV/CMV/CSP',
    forecast: 200000,
    actual: 195000,
    previousMonth: 185000,
    type: 'expense'
  },
  {
    title: 'Despesas Operacionais',
    forecast: 150000,
    actual: 158000,
    previousMonth: 145000,
    type: 'expense'
  },
  {
    title: 'Despesas Não Operacionais',
    forecast: 25000,
    actual: 30000,
    previousMonth: 28000,
    type: 'expense'
  },
  {
    title: 'Saldo Final',
    forecast: 125000,
    actual: 102000,
    previousMonth: 102000,
    type: 'balance'
  }
];

// Budget data following Omie structure with proper financial flow
export const budgetData: BudgetItem[] = [
  {
    id: '0',
    code: '=',
    category: 'SALDO INICIAL',
    type: 'balance',
    forecast: 150000,
    actual: 145000,
    budgeted: 150000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false
  },
  {
    id: '3',
    code: '3.0.00.00',
    category: 'RECEITAS',
    type: 'revenue',
    forecast: 500000,
    actual: 485000,
    budgeted: 520000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false,
    subcategories: [
      {
        id: '3.1',
        code: '3.1.01.00',
        category: 'Receita de Vendas',
        type: 'revenue',
        forecast: 450000,
        actual: 435000,
        budgeted: 470000,
        accountType: 'analytical',
        level: 1
      },
      {
        id: '3.2',
        code: '3.1.02.00',
        category: 'Receita Financeira',
        type: 'revenue',
        forecast: 50000,
        actual: 50000,
        budgeted: 50000,
        accountType: 'analytical',
        level: 1
      }
    ]
  },
  {
    id: '4',
    code: '4.0.00.00',
    category: 'CPV/CMV/CSP',
    type: 'expense',
    forecast: 200000,
    actual: 195000,
    budgeted: 190000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false,
    subcategories: [
      {
        id: '4.1',
        code: '4.1.01.00',
        category: 'Custo dos Produtos Vendidos',
        type: 'expense',
        forecast: 120000,
        actual: 115000,
        budgeted: 112000,
        accountType: 'analytical',
        level: 1
      },
      {
        id: '4.2',
        code: '4.1.02.00',
        category: 'Custo da Mercadoria Vendida',
        type: 'expense',
        forecast: 80000,
        actual: 80000,
        budgeted: 78000,
        accountType: 'analytical',
        level: 1
      }
    ]
  },
  {
    id: '5',
    code: '5.0.00.00',
    category: 'DESPESAS OPERACIONAIS',
    type: 'expense',
    forecast: 150000,
    actual: 158000,
    budgeted: 145000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false,
    subcategories: [
      {
        id: '5.1',
        code: '5.1.01.00',
        category: 'Despesas com Pessoal',
        type: 'expense',
        forecast: 80000,
        actual: 85000,
        budgeted: 78000,
        accountType: 'analytical',
        level: 1
      },
      {
        id: '5.2',
        code: '5.1.02.00',
        category: 'Despesas Comerciais',
        type: 'expense',
        forecast: 30000,
        actual: 32000,
        budgeted: 28000,
        accountType: 'analytical',
        level: 1
      },
      {
        id: '5.3',
        code: '5.1.03.00',
        category: 'Despesas Administrativas',
        type: 'expense',
        forecast: 40000,
        actual: 41000,
        budgeted: 39000,
        accountType: 'analytical',
        level: 1
      }
    ]
  },
  {
    id: '6',
    code: '6.0.00.00',
    category: 'DESPESAS NÃO OPERACIONAIS',
    type: 'expense',
    forecast: 25000,
    actual: 30000,
    budgeted: 25000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false,
    subcategories: [
      {
        id: '6.1',
        code: '6.1.01.00',
        category: 'Despesas Financeiras',
        type: 'expense',
        forecast: 15000,
        actual: 18000,
        budgeted: 15000,
        accountType: 'analytical',
        level: 1
      },
      {
        id: '6.2',
        code: '6.1.02.00',
        category: 'Outras Despesas Não Operacionais',
        type: 'expense',
        forecast: 10000,
        actual: 12000,
        budgeted: 10000,
        accountType: 'analytical',
        level: 1
      }
    ]
  },
  {
    id: '7',
    code: '=',
    category: 'SALDO FINAL',
    type: 'balance',
    forecast: 125000,
    actual: 102000,
    budgeted: 130000,
    accountType: 'synthetic',
    level: 0,
    isExpanded: false
  }
];

// Omie-based Chart of Accounts structure
export const financialAccounts: FinancialAccount[] = [
  // 01. RECEITAS DIRETAS
  { id: '01', code: '01', name: 'Receitas Diretas', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '01.001', code: '01.001', name: 'Clientes - Honorário Recorrente', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.002', code: '01.002', name: 'Recuperação de Receita Recorrente', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.003', code: '01.003', name: 'Clientes - Curadoria', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.004', code: '01.004', name: 'Clientes - Legalização', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.005', code: '01.005', name: 'Clientes - Receita Tributária', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.006', code: '01.006', name: 'Clientes - Consultoria', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.007', code: '01.007', name: 'Clientes - Honorário Extraordinário', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.008', code: '01.008', name: 'Clientes - Certificado Digital', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.009', code: '01.009', name: 'Clientes - IRPF', type: 'analytical', parent: '01', category: 'revenue', level: 1 },
  { id: '01.010', code: '01.010', name: 'Clientes - Adicional Anual', type: 'analytical', parent: '01', category: 'revenue', level: 1 },

  // 02. RECEITAS INDIRETAS
  { id: '02', code: '02', name: 'Receitas Indiretas', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '02.001', code: '02.001', name: 'Comissões Recebidas', type: 'analytical', parent: '02', category: 'revenue', level: 1 },
  { id: '02.002', code: '02.002', name: 'Estorno de Reembolso de Despesas', type: 'analytical', parent: '02', category: 'revenue', level: 1 },

  // 03. RECEITA FINANCEIRA
  { id: '03', code: '03', name: 'Receita Financeira', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '03.001', code: '03.001', name: 'Rendimento Financeiro', type: 'analytical', parent: '03', category: 'revenue', level: 1 },

  // 04. OUTRAS RECEITAS
  { id: '04', code: '04', name: 'Outras Receitas', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '04.001', code: '04.001', name: 'Aporte Junior', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.002', code: '04.002', name: 'Aporte Médio', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.003', code: '04.003', name: 'Empréstimo sócio Junior', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.004', code: '04.004', name: 'Empréstimo sócio Médio', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.005', code: '04.005', name: 'Receita Ativo', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.006', code: '04.006', name: 'Transferência entre empresas (Entrada)', type: 'analytical', parent: '04', category: 'revenue', level: 1 },

  // 05. DESPESAS COMERCIAIS
  { id: '05', code: '05', name: 'Despesas Comerciais', type: 'synthetic', category: 'expense', level: 0 },
  { id: '05.001', code: '05.001', name: 'Brindes/Presentes', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.002', code: '05.002', name: 'Comissões (comercial)', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.003', code: '05.003', name: 'Eventos', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.004', code: '05.004', name: 'Impulsionamentos', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.005', code: '05.005', name: 'Serviços Terceiros MKT', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.006', code: '05.006', name: 'Relacionamento com Clientes (Comercial)', type: 'analytical', parent: '05', category: 'expense', level: 1 },

  // 06. DESPESAS COM PESSOAL
  { id: '06', code: '06', name: 'Despesas com Pessoal', type: 'synthetic', category: 'expense', level: 0 },
  { id: '06.001', code: '06.001', name: '13º Salário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.002', code: '06.002', name: 'Ajuda de Custo', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.003', code: '06.003', name: 'Assistência Médica/Odontológica', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.004', code: '06.004', name: 'Cursos e Treinamentos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.005', code: '06.005', name: 'Exames Médicos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.006', code: '06.006', name: 'Férias', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.007', code: '06.007', name: 'FGTS', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.008', code: '06.008', name: 'Freela - Serviços Técnicos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.009', code: '06.009', name: 'INSS', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.010', code: '06.010', name: 'IRRF', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.011', code: '06.011', name: 'Outros Benefícios', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.012', code: '06.012', name: 'PLR', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.013', code: '06.013', name: 'Premiação', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.014', code: '06.014', name: 'Rescisões', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.015', code: '06.015', name: 'Salário - Diretores', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.016', code: '06.016', name: 'Salário - Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.008', code: '10.008', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },


  // 02. RECEITAS INDIRETAS
  { id: '02', code: '02', name: 'Receitas Indiretas', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '02.001', code: '02.001', name: 'Comissões Recebidas', type: 'analytical', parent: '02', category: 'revenue', level: 1 },
  { id: '02.002', code: '02.002', name: 'Estorno de Reembolso de Despesas', type: 'analytical', parent: '02', category: 'revenue', level: 1 },

  // 03. RECEITA FINANCEIRA
  { id: '03', code: '03', name: 'Receita Financeira', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '03.001', code: '03.001', name: 'Rendimento Financeiro', type: 'analytical', parent: '03', category: 'revenue', level: 1 },

  // 04. OUTRAS RECEITAS
  { id: '04', code: '04', name: 'Outras Receitas', type: 'synthetic', category: 'revenue', level: 0 },
  { id: '04.001', code: '04.001', name: 'Aporte Junior', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.002', code: '04.002', name: 'Aporte Médio', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.003', code: '04.003', name: 'Empréstimo sócio Junior', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.004', code: '04.004', name: 'Empréstimo sócio Médio', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.005', code: '04.005', name: 'Receita Ativo', type: 'analytical', parent: '04', category: 'revenue', level: 1 },
  { id: '04.006', code: '04.006', name: 'Transferência entre empresas (Entrada)', type: 'analytical', parent: '04', category: 'revenue', level: 1 },

  // 05. DESPESAS COMERCIAIS
  { id: '05', code: '05', name: 'Despesas Comerciais', type: 'synthetic', category: 'expense', level: 0 },
  { id: '05.001', code: '05.001', name: 'Brindes/Presentes', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.002', code: '05.002', name: 'Comissões (comercial)', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.003', code: '05.003', name: 'Eventos', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.004', code: '05.004', name: 'Impulsionamentos', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.005', code: '05.005', name: 'Serviços Terceiros MKT', type: 'analytical', parent: '05', category: 'expense', level: 1 },
  { id: '05.006', code: '05.006', name: 'Relacionamento com Clientes (Comercial)', type: 'analytical', parent: '05', category: 'expense', level: 1 },

  // 06. DESPESAS COM PESSOAL
  { id: '06', code: '06', name: 'Despesas com Pessoal', type: 'synthetic', category: 'expense', level: 0 },
  { id: '06.001', code: '06.001', name: '13º Salário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.002', code: '06.002', name: 'Ajuda de Custo', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.003', code: '06.003', name: 'Assistência Médica/Odontológica', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.004', code: '06.004', name: 'Cursos e Treinamentos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.005', code: '06.005', name: 'Exames Médicos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.006', code: '06.006', name: 'Férias', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.007', code: '06.007', name: 'FGTS', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.008', code: '06.008', name: 'Freela - Serviços Técnicos', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.009', code: '06.009', name: 'INSS', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.010', code: '06.010', name: 'IRRF', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.011', code: '06.011', name: 'Outros Benefícios', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.012', code: '06.012', name: 'PLR', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.013', code: '06.013', name: 'Premiação', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.014', code: '06.014', name: 'Rescisões', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.015', code: '06.015', name: 'Salário - Diretores', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.016', code: '06.016', name: 'Salário - Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.017', code: '06.017', name: 'Seguro de Vida', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.018', code: '06.018', name: 'Pró-Labore Funcionários', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.019', code: '06.019', name: 'Vale Funcionário', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.020', code: '06.020', name: 'Vale Refeição', type: 'analytical', parent: '06', category: 'expense', level: 1 },
  { id: '06.021', code: '06.021', name: 'Vale Transporte', type: 'analytical', parent: '06', category: 'expense', level: 1 },

  // 07. DESPESAS ADMINISTRATIVAS
  { id: '07', code: '07', name: 'Despesas Administrativas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '07.001', code: '07.001', name: 'Água e Esgoto', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.002', code: '07.002', name: 'Aluguel de Imóvel', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.003', code: '07.003', name: 'Associações de Classe', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.004', code: '07.004', name: 'Condomínio', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.005', code: '07.005', name: 'Consultoria Jurídica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.006', code: '07.006', name: 'Cópia / Cozinha', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.007', code: '07.007', name: 'Cursos e Treinamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.008', code: '07.008', name: 'Despesas Legais / Custas Judiciais', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.009', code: '07.009', name: 'Doação', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.010', code: '07.010', name: 'Endereço Listing', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.011', code: '07.011', name: 'Energia Elétrica', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.012', code: '07.012', name: 'Financeiro - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.013', code: '07.013', name: 'Internet - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.014', code: '07.014', name: 'IPTU', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.015', code: '07.015', name: 'Locação de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.016', code: '07.016', name: 'Manutenção Ar Condicionado - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.017', code: '07.017', name: 'Manutenção de Equipamentos', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.018', code: '07.018', name: 'Manutenção de Imobilizado', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.019', code: '07.019', name: 'Manutenção Infra TI - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.020', code: '07.020', name: 'Material de Escritório e Limpeza', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.021', code: '07.021', name: 'RH - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.022', code: '07.022', name: 'Seguros', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.023', code: '07.023', name: 'Serviços de Limpeza - Rateio MMA', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.024', code: '07.024', name: 'Serviços de Rua', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.025', code: '07.025', name: 'Sistemas e Servidores', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.026', code: '07.026', name: 'Taxas Diversas', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.027', code: '07.027', name: 'Telefonia', type: 'analytical', parent: '07', category: 'expense', level: 1 },
  { id: '07.028', code: '07.028', name: 'TI - Rateio CF', type: 'analytical', parent: '07', category: 'expense', level: 1 },

  // 08. DESPESAS FINANCEIRAS / BANCOS
  { id: '08', code: '08', name: 'Despesas Financeiras / Bancos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '08.001', code: '08.001', name: 'Tarifas Bancárias', type: 'analytical', parent: '08', category: 'expense', level: 1 },

  // 09. IMPOSTOS E TAXAS
  { id: '09', code: '09', name: 'Impostos e Taxas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '09.001', code: '09.001', name: 'COFINS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.002', code: '09.002', name: 'CSRF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.003', code: '09.003', name: 'Impostos - Parcelamento', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.004', code: '09.004', name: 'IOF', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.005', code: '09.005', name: 'ISS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.006', code: '09.006', name: 'PIS', type: 'analytical', parent: '09', category: 'expense', level: 1 },
  { id: '09.007', code: '09.007', name: 'Simples Nacional (DAS)', type: 'analytical', parent: '09', category: 'expense', level: 1 },

  // 10. INVESTIMENTO
  { id: '10', code: '10', name: 'Investimento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '10.001', code: '10.001', name: 'INV - Novas Unidades de Negócio', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.002', code: '10.002', name: 'INV - Obras e Reformas', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.003', code: '10.003', name: 'INV - Computadores e periféricos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.004', code: '10.004', name: 'INV - Móveis e Utensílios', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.005', code: '10.005', name: 'INV - Outros Investimentos', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.006', code: '10.006', name: 'INV - Comunicação e Marketing', type: 'analytical', parent: '10', category: 'expense', level: 1 },
  { id: '10.007', code: '10.007', name: 'INV - Nova Sede', type: 'analytical', parent: '10', category: 'expense', level: 1 },

  // 11. ENDIVIDAMENTO
  { id: '11', code: '11', name: 'Endividamento', type: 'synthetic', category: 'expense', level: 0 },
  { id: '11.001', code: '11.001', name: 'Pagamento de Empréstimo', type: 'analytical', parent: '11', category: 'expense', level: 1 },

  // 12. OUTRAS DESPESAS
  { id: '12', code: '12', name: 'Outras Despesas', type: 'synthetic', category: 'expense', level: 0 },
  { id: '12.001', code: '12.001', name: 'Devolução Empréstimo Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.002', code: '12.002', name: 'Devolução Empréstimo Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.003', code: '12.003', name: 'Transferência entre empresas (Saída)', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.004', code: '12.004', name: 'Devolução - Aporte Junior', type: 'analytical', parent: '12', category: 'expense', level: 1 },
  { id: '12.005', code: '12.005', name: 'Devolução - Aporte Médio', type: 'analytical', parent: '12', category: 'expense', level: 1 },

  // 13. DESPESAS REEMBOLSÁVEIS
  { id: '13', code: '13', name: 'Despesas Reembolsáveis', type: 'synthetic', category: 'expense', level: 0 },
  { id: '13.001', code: '13.001', name: 'Despesas Reembolsáveis', type: 'analytical', parent: '13', category: 'expense', level: 1 },

  // 14. CUSTOS GERAIS DIRETOS
  { id: '14', code: '14', name: 'Custos Gerais Diretos', type: 'synthetic', category: 'expense', level: 0 },
  { id: '14.001', code: '14.001', name: 'Custo Certificado Digital', type: 'analytical', parent: '14', category: 'expense', level: 1 },
  { id: '14.002', code: '14.002', name: 'Custo Geral Direto - Despesas Operacional', type: 'analytical', parent: '14', category: 'expense', level: 1 },

  // 15. DISTRIBUIÇÃO DO LUCRO
  { id: '15', code: '15', name: 'Distribuição do Lucro', type: 'expense', category: 'expense', level: 0 },
  { id: '15.001', code: '15.001', name: 'Distribuição de Lucros', type: 'analytical', parent: '15', category: 'expense', level: 1 }
];

export const businessTypes: BusinessType[] = [
  { id: 'services', name: 'Serviços', margin: 0.30 },
  { id: 'retail', name: 'Varejo', margin: 0.15 },
  { id: 'industry', name: 'Indústria', margin: 0.08 }
];

export const chartData: ChartData[] = [
  { month: 'Jan', current: 420000, previous: 380000, forecast: 450000 },
  { month: 'Fev', current: 460000, previous: 420000, forecast: 480000 },
  { month: 'Mar', current: 485000, previous: 460000, forecast: 500000 },
  { month: 'Abr', current: 0, previous: 485000, forecast: 520000 },
  { month: 'Mai', current: 0, previous: 0, forecast: 540000 },
  { month: 'Jun', current: 0, previous: 0, forecast: 560000 }
];