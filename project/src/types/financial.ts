export interface KPICard {
  title: string;
  forecast: number;
  actual: number;
  previousMonth: number;
  type: 'revenue' | 'expense' | 'balance';
  marginPercentage?: number;
  expectedMargin?: number;
}

export interface BudgetItem {
  id: string;
  code: string;
  category: string;
  type: 'revenue' | 'expense' | 'balance';
  forecast: number;
  actual: number;
  budgeted: number;
  accountType: 'synthetic' | 'analytical';
  level: number;
  parentCode?: string;
  isExpanded?: boolean;
  subcategories?: BudgetItem[];
}

export interface ChartData {
  month: string;
  current: number;
  previous: number;
  forecast: number;
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'synthetic' | 'analytical';
  parentId?: string;
  level: number;
  children?: ChartOfAccount[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  syntheticGroups: number;
  analyticalAccounts: number;
  errors?: string[];
}

export interface BusinessType {
  id: string;
  name: string;
  margin: number;
}

export interface FinancialAccount {
  id: string;
  code: string;
  name: string;
  type: 'synthetic' | 'analytical';
  parent?: string;
  category: 'revenue' | 'expense';
  level: number;
}