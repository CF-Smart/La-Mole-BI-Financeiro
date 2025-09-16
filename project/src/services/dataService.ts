import * as XLSX from 'xlsx';
import { KPICard } from '../types/financial';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, hasSupabaseConfig } from './supabaseClient';

// Data Service - Centralized data management with factory reset capability
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

export interface BudgetData {
  id: string;
  code: string;
  category: string;
  type: 'revenue' | 'expense' | 'balance';
  actual: number;
  forecast: number;
  budgeted: number;
  accountType: 'synthetic' | 'analytical';
  level: number;
  parentCode?: string;
  subcategories?: BudgetData[];
}

export interface ImportHistory {
  id: string;
  type: 'database';
  fileName: string;
  timestamp: string;
  status: 'success' | 'error';
  recordCount: number;
  userId?: string;
}

export interface ResetLog {
  id: string;
  userId: string;
  timestamp: string;
  steps: string[];
  success: boolean;
  error?: string;
  duration: number;
}

// In-memory data store
class DataStore {
  private chartOfAccounts: ChartOfAccount[] = [];
  private forecastData: any[] = [];
  private actualData: any[] = [];
  private kpiData: KPICard[] = [];
  private budgetData: BudgetData[] = [];
  private importHistory: ImportHistory[] = [];
  private resetLogs: ResetLog[] = [];
  private rawImportDataMap: Record<string, any[][]> = {};
  private activeDatasetName: string | null = null;

  constructor() {}

  // LocalStorage keys
  private LS_DATASETS_KEY = '__datasets__';
  private LS_ACTIVE_DATASET_KEY = '__active_dataset__';
  private LS_IMPORT_HISTORY_KEY = '__import_history__';

  private persistDatasets(): void {
    try {
      if (typeof window === 'undefined') return;
      const payload = JSON.stringify(this.rawImportDataMap);
      window.localStorage.setItem(this.LS_DATASETS_KEY, payload);
      if (this.activeDatasetName) {
        window.localStorage.setItem(this.LS_ACTIVE_DATASET_KEY, this.activeDatasetName);
      }
    } catch {}
  }

  loadDatasetsFromLocalStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem(this.LS_DATASETS_KEY) || '{}';
      const map = JSON.parse(raw);
      if (map && typeof map === 'object') {
        this.rawImportDataMap = map;
      }
      const active = window.localStorage.getItem(this.LS_ACTIVE_DATASET_KEY);
      if (active && this.rawImportDataMap[active]) {
        this.activeDatasetName = active;
      } else {
        const first = Object.keys(this.rawImportDataMap)[0];
        this.activeDatasetName = first || null;
      }
      try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('dataset-changed')); } catch {}
    } catch {}
  }

  private persistImportHistory(): void {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(this.LS_IMPORT_HISTORY_KEY, JSON.stringify(this.importHistory));
    } catch {}
  }

  loadImportHistoryFromLocalStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem(this.LS_IMPORT_HISTORY_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) this.importHistory = list;
      }
    } catch {}
  }

  // Chart of Accounts methods
  getChartOfAccounts(): ChartOfAccount[] {
    return [...this.chartOfAccounts];
  }

  setChartOfAccounts(accounts: ChartOfAccount[]): void {
    this.chartOfAccounts = [...accounts];
  }

  clearChartOfAccounts(): void {
    this.chartOfAccounts = [];
  }

  // Forecast data methods
  getForecastData(): any[] {
    return [...this.forecastData];
  }

  setForecastData(data: any[]): void {
    this.forecastData = [...data];
  }

  clearForecastData(): void {
    this.forecastData = [];
  }

  // Actual data methods
  getActualData(): any[] {
    return [...this.actualData];
  }

  setActualData(data: any[]): void {
    this.actualData = [...data];
  }

  clearActualData(): void {
    this.actualData = [];
  }

  // KPI data methods
  getKPIData(): KPICard[] {
    return [...this.kpiData];
  }

  setKPIData(data: KPICard[]): void {
    this.kpiData = [...data];
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('kpi-updated'));
      }
    } catch {}
  }

  clearKPIData(): void {
    this.kpiData = [];
  }

  // Budget data methods
  getBudgetData(): BudgetData[] {
    return [...this.budgetData];
  }

  setBudgetData(data: BudgetData[]): void {
    this.budgetData = [...data];
  }

  clearBudgetData(): void {
    this.budgetData = [];
  }

  // Import history methods
  getImportHistory(): ImportHistory[] {
    return [...this.importHistory];
  }

  addImportHistory(entry: ImportHistory): void {
    const existingIndex = this.importHistory.findIndex(item => item.id === entry.id);
    if (existingIndex >= 0) {
      this.importHistory[existingIndex] = entry;
    } else {
      this.importHistory.push(entry);
    }
    this.persistImportHistory();
  }

  clearImportHistory(): void {
    this.importHistory = [];
  }

  // Reset logs methods
  getResetLogs(): ResetLog[] {
    return [...this.resetLogs];
  }

  addResetLog(log: ResetLog): void {
    this.resetLogs.push(log);
  }

  // Delete individual import by ID
  deleteImportById(importId: string): void {
    this.importHistory = this.importHistory.filter(item => item.id !== importId);
    this.persistImportHistory();
  }

  // Raw import data methods
  getRawImportData(): any[][] | null {
    if (this.activeDatasetName && this.rawImportDataMap[this.activeDatasetName]) {
      return this.rawImportDataMap[this.activeDatasetName];
    }
    const first = Object.keys(this.rawImportDataMap)[0];
    return first ? this.rawImportDataMap[first] : null;
  }

  setRawImportData(data: any[][], datasetName: string): void {
    const name = datasetName || `dataset-${Date.now()}`;
    this.rawImportDataMap[name] = data;
    if (!this.activeDatasetName) this.activeDatasetName = name;
    try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('dataset-changed')); } catch {}
    this.persistDatasets();
  }

  clearRawImportData(): void {
    this.rawImportDataMap = {};
    this.activeDatasetName = null;
    try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('dataset-changed')); } catch {}
    this.persistDatasets();
  }

  getDatasetNames(): string[] {
    return Object.keys(this.rawImportDataMap);
  }

  getActiveDatasetName(): string | null {
    return this.activeDatasetName;
  }

  setActiveDataset(name: string): void {
    if (name && this.rawImportDataMap[name]) {
      this.activeDatasetName = name;
      try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('dataset-changed')); } catch {}
      this.persistDatasets();
    }
  }

  // Complete factory reset
  factoryReset(): void {
    this.chartOfAccounts = [];
    this.forecastData = [];
    this.actualData = [];
    this.kpiData = [];
    this.budgetData = [];
    this.importHistory = [];
    this.rawImportDataMap = {};
    this.activeDatasetName = null;
    // no browser storage persistence
    // Keep reset logs for audit trail
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(this.LS_DATASETS_KEY);
        window.localStorage.removeItem(this.LS_ACTIVE_DATASET_KEY);
        window.localStorage.removeItem(this.LS_IMPORT_HISTORY_KEY);
      }
    } catch {}
  }

  // Check if system has any data
  isEmpty(): boolean {
    return (
      this.chartOfAccounts.length === 0 &&
      this.forecastData.length === 0 &&
      this.actualData.length === 0 &&
      this.kpiData.length === 0 &&
      this.budgetData.length === 0 &&
      this.importHistory.length === 0
    );
  }
}

// Singleton data store instance
const dataStore = new DataStore();

// Data Service class
export class DataService {
  private static instance: DataService;
  private currentUserId: string = 'user-1'; // Simulate current user
  private AUTH_KEY = '__auth_user__';
  private supabase: SupabaseClient | null = null;
  
  // Conta Azul validation helpers
  private isValidAccountCode(code: string): boolean {
    // Groups (synthetic): 3-digit codes (e.g., 3.01)
    // Analytical accounts: 5-digit codes (e.g., 3.01.01)
    const groupPattern = /^\d\.\d{2}$/; // e.g., 3.01
    const analyticalPattern = /^\d\.\d{2}\.\d{2}$/; // e.g., 3.01.01
    return groupPattern.test(code) || analyticalPattern.test(code);
  }
  
  private getParentCode(code: string): string | null {
    // Extract parent code from analytical account
    // e.g., 3.01.01 -> 3.01
    const parts = code.split('.');
    if (parts.length === 3) {
      return `${parts[0]}.${parts[1]}`;
    }
    return null;
  }
  
  private isGroupCode(code: string): boolean {
    // Groups have 3-digit pattern (e.g., 3.01)
    return /^\d\.\d{2}$/.test(code);
  }
  
  private isAnalyticalCode(code: string): boolean {
    // Analytical accounts have 5-digit pattern (e.g., 3.01.01)
    return /^\d\.\d{2}\.\d{2}$/.test(code);
  }
  
  private validateAccountHierarchy(accounts: any[]): string[] {
    const errors: string[] = [];
    const groupCodes = new Set<string>();
    const analyticalAccounts: any[] = [];
    
    // Separate groups and analytical accounts
    accounts.forEach(account => {
      if (this.isGroupCode(account.code)) {
        groupCodes.add(account.code);
      } else if (this.isAnalyticalCode(account.code)) {
        analyticalAccounts.push(account);
      }
    });
    
    // Validate that each analytical account has a parent group
    analyticalAccounts.forEach(account => {
      const parentCode = this.getParentCode(account.code);
      if (parentCode && !groupCodes.has(parentCode)) {
        errors.push(`❌ Conta analítica ${account.code} (${account.description}) não possui grupo pai ${parentCode}`);
      }
    });
    
    return errors;
  }
  
  private buildAccountHierarchy(accounts: any[]): BudgetData[] {
    const accountMap = new Map<string, BudgetData>();
    const groups = new Map<string, BudgetData>();
    const analyticalAccounts: BudgetData[] = [];
    
    // First pass: create all accounts
    accounts.forEach((account, index) => {
      const budgetItem: BudgetData = {
        id: `budget-${index + 1}`,
        code: account.code,
        category: account.description,
        type: account.type === 'Receita' ? 'revenue' : 'expense',
        actual: account.monthlyValues[2] || 0, // March as current month
        forecast: account.monthlyValues[2] || 0,
        budgeted: account.monthlyValues[2] || 0,
        accountType: this.isGroupCode(account.code) ? 'synthetic' : 'analytical',
        level: this.isGroupCode(account.code) ? 0 : 1,
        parentCode: this.getParentCode(account.code) || undefined,
        subcategories: []
      };
      
      accountMap.set(account.code, budgetItem);
      
      if (this.isGroupCode(account.code)) {
        groups.set(account.code, budgetItem);
      } else {
        analyticalAccounts.push(budgetItem);
      }
    });
    
    // Second pass: build hierarchy
    analyticalAccounts.forEach(analytical => {
      if (analytical.parentCode) {
        const parent = groups.get(analytical.parentCode);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push(analytical);
          
          // Update parent totals (sum of children)
          parent.actual = (parent.subcategories || []).reduce((sum, child) => sum + child.actual, 0);
          parent.forecast = (parent.subcategories || []).reduce((sum, child) => sum + child.forecast, 0);
          parent.budgeted = (parent.subcategories || []).reduce((sum, child) => sum + child.budgeted, 0);
        }
      }
    });
    
    // Return only top-level groups (synthetic accounts)
    return Array.from(groups.values()).sort((a, b) => a.code.localeCompare(b.code));
  }
  
  private validateGroupTotals(hierarchy: BudgetData[]): string[] {
    const errors: string[] = [];
    
    hierarchy.forEach(group => {
      if (group.subcategories && group.subcategories.length > 0) {
        const calculatedActual = group.subcategories.reduce((sum, child) => sum + child.actual, 0);
        const calculatedForecast = group.subcategories.reduce((sum, child) => sum + child.forecast, 0);
        const calculatedBudgeted = group.subcategories.reduce((sum, child) => sum + child.budgeted, 0);
        
        const actualDiff = Math.abs(group.actual - calculatedActual);
        const forecastDiff = Math.abs(group.forecast - calculatedForecast);
        const budgetedDiff = Math.abs(group.budgeted - calculatedBudgeted);
        
        if (actualDiff > 0.01) {
          errors.push(`⚠️ Grupo ${group.code}: Diferença no valor real de R$ ${actualDiff.toFixed(2)}`);
        }
        if (forecastDiff > 0.01) {
          errors.push(`⚠️ Grupo ${group.code}: Diferença no forecast de R$ ${forecastDiff.toFixed(2)}`);
        }
        if (budgetedDiff > 0.01) {
          errors.push(`⚠️ Grupo ${group.code}: Diferença no orçado de R$ ${budgetedDiff.toFixed(2)}`);
        }
      }
    });
    
    return errors;
  }

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
      // Initialize Supabase client
      try {
        (DataService.instance as any).supabase = getSupabaseClient();
      } catch {}
    }
    return DataService.instance;
  }

  // Expor carregamento local para o app
  loadLocalDatasets(): void {
    try { (dataStore as any).loadDatasetsFromLocalStorage?.(); } catch {}
    try { (dataStore as any).loadImportHistoryFromLocalStorage?.(); } catch {}
  }

  // Factory Reset Implementation
  async performFactoryReset(): Promise<{ success: boolean; message: string; steps: string[]; duration: number }> {
    const startTime = Date.now();
    const steps: string[] = [];
    const resetId = `reset-${Date.now()}`;

    try {
      // Step 1: Clear localStorage and sessionStorage
      steps.push('Clearing browser storage...');
      localStorage.clear();
      sessionStorage.clear();

      // Step 2: Clear in-memory data store
      steps.push('Purging in-memory data store...');
      dataStore.factoryReset();

      // Step 3: Clear any cached data
      steps.push('Clearing application caches...');
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Step 4: Reset computed state
      steps.push('Resetting computed views and indexes...');
      // Any computed state would be reset here

      // Step 5: Stop background jobs (simulated)
      steps.push('Stopping background processes...');
      // Clear any intervals or timeouts that might repopulate data

      // Step 6: Verify empty state
      steps.push('Verifying empty state...');
      const isEmpty = dataStore.isEmpty();
      if (!isEmpty) {
        throw new Error('Factory reset verification failed - data still present');
      }

      const duration = Date.now() - startTime;
      steps.push(`Factory reset completed successfully in ${duration}ms`);

      // Log the successful reset
      const resetLog: ResetLog = {
        id: resetId,
        userId: this.currentUserId,
        timestamp: new Date().toISOString(),
        steps: [...steps],
        success: true,
        duration
      };
      dataStore.addResetLog(resetLog);

      return {
        success: true,
        message: 'Factory reset completed successfully. All data has been cleared.',
        steps,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      steps.push(`ERROR: ${errorMessage}`);

      // Log the failed reset
      const resetLog: ResetLog = {
        id: resetId,
        userId: this.currentUserId,
        timestamp: new Date().toISOString(),
        steps: [...steps],
        success: false,
        error: errorMessage,
        duration
      };
      dataStore.addResetLog(resetLog);

      return {
        success: false,
        message: `Factory reset failed: ${errorMessage}`,
        steps,
        duration
      };
    }
  }

  // Individual clear methods
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      dataStore.clearChartOfAccounts();
      dataStore.clearForecastData();
      dataStore.clearActualData();
      dataStore.clearKPIData();
      dataStore.clearBudgetData();
      return { success: true, message: 'All data cleared successfully' };
    } catch (error) {
      return { success: false, message: `Failed to clear data: ${error}` };
    }
  }

  // Conta Azul Database import
  async importContaAzulDatabase(file: File): Promise<ImportResult> {
    // Validate file format first
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      const historyEntry: ImportHistory = {
        id: `import-${Date.now()}`,
        type: 'database',
        fileName: file.name,
        timestamp: new Date().toISOString(),
        status: 'error',
        recordCount: 0
      };
      dataStore.addImportHistory(historyEntry);

      return {
        success: false,
        message: '🚫 FORMATO DE ARQUIVO INVÁLIDO: Apenas arquivos .xlsx são aceitos.',
        syntheticGroups: 0,
        analyticalAccounts: 0,
        errors: [
          `❌ Arquivo fornecido: ${file.name}`,
          '✅ Formato esperado: .xlsx (Excel)',
          '',
          '💡 SOLUÇÃO:',
          '1. Exporte seus dados em formato .xlsx',
          '2. Ou converta seu arquivo atual para formato .xlsx',
          '3. Tente importar novamente'
        ]
      };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            resolve({
              success: false,
              message: '🚫 ARQUIVO VAZIO: O arquivo .xlsx não contém planilhas.',
              syntheticGroups: 0,
              analyticalAccounts: 0,
              errors: ['Arquivo .xlsx está vazio ou corrompido']
            });
            return;
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
          
          if (jsonData.length < 3) {
            // Add failed import to history
            const historyEntry: ImportHistory = {
              id: `import-${Date.now()}`,
              type: 'database',
              fileName: file.name,
              timestamp: new Date().toISOString(),
              status: 'error',
              recordCount: 0
            };
            dataStore.addImportHistory(historyEntry);

            resolve({
              success: false,
              message: 'Arquivo deve conter pelo menos 3 linhas (cabeçalho + dados)',
              syntheticGroups: 0,
              analyticalAccounts: 0,
              errors: ['Arquivo deve ter estrutura: Linha 1=Cabeçalho, Linha 3+=Dados das categorias']
            });
            return;
          }

          // Parse header to validate structure (tolerante a formatos)
          const header = (jsonData[0] as any[]).map(col => String(col || '').trim());
          this.validateContaAzulStructure(jsonData, header, file.name);
          
          // Process data rows (starting from row 3)
          const accounts: ChartOfAccount[] = [];
          const forecastData: any[] = [];
          const actualData: any[] = [];
          const kpiData: KPICard[] = [];
          const budgetData: BudgetData[] = [];
          const errors: string[] = [];
          const skippedRows: number[] = [];
          let validRows = 0;
          let accountId = 1;

          // Process data rows (starting from row 3, index 2)
          for (let i = 2; i < jsonData.length; i++) {
            const rowNumber = i + 1;
            const columns = (jsonData[i] as any[]).map(col => String(col || '').trim());
            
            // Skip rows with empty account code
            if (columns.length === 0 || !columns[0]) {
              skippedRows.push(rowNumber);
              continue;
            }

            const categoryName = columns[0].trim();
            const accountCode = this.generateAccountCode(categoryName, accountId);
            const type = this.inferAccountTypeFromName(categoryName);
            
            // Parse monthly values - extract forecast and actual for each month (modo padrão ou simplificado)
            const monthlyForecast: number[] = [];
            const monthlyActual: number[] = [];
            let hasParsingError = false;
            let hasAnyData = false;

            const isSimplified = header.length < 27;
            if (!isSimplified) {
              // Padrão: pares Previsto/Realizado
              for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const forecastColIndex = 1 + (monthIndex * 2);
                const actualColIndex = 2 + (monthIndex * 2);
                const rawForecast = columns[forecastColIndex] || '0';
                const rawActual = columns[actualColIndex] || '0';
                const forecastValue = parseFloat(rawForecast.replace(/[^\d.-]/g, ''));
                const actualValue = parseFloat(rawActual.replace(/[^\d.-]/g, ''));
                if (isNaN(forecastValue) || isNaN(actualValue)) {
                  hasParsingError = true;
                  break;
                }
                monthlyForecast.push(forecastValue);
                monthlyActual.push(actualValue);
                if (forecastValue !== 0 || actualValue !== 0) hasAnyData = true;
              }
            } else {
              // Simplificado: apenas uma coluna por mês (assumir como Realizado)
              for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const colIndex = 1 + monthIndex;
                const rawVal = columns[colIndex] || '0';
                const val = parseFloat(String(rawVal).replace(/[^\d.-]/g, ''));
                if (isNaN(val)) { hasParsingError = true; break; }
                monthlyForecast.push(val);
                monthlyActual.push(val);
                if (val !== 0) hasAnyData = true;
              }
            }

            if (hasParsingError) {
              continue;
            }

            // Skip rows with no meaningful data
            if (!hasAnyData) {
              skippedRows.push(rowNumber);
              continue;
            }

            // Create chart of account entry
            const account: ChartOfAccount = {
              id: `account-${accountId}`,
              code: accountCode,
              name: categoryName,
              type: 'analytical',
              level: 1
            };
            accounts.push(account);

            // Create forecast and actual data entries
            const totalForecast = monthlyForecast.reduce((sum, val) => sum + val, 0);
            const totalActual = monthlyActual.reduce((sum, val) => sum + val, 0);
            
            const forecastEntry = {
              category: categoryName,
              january: monthlyForecast[0],
              february: monthlyForecast[1],
              march: monthlyForecast[2],
              april: monthlyForecast[3],
              may: monthlyForecast[4],
              june: monthlyForecast[5],
              july: monthlyForecast[6],
              august: monthlyForecast[7],
              september: monthlyForecast[8],
              october: monthlyForecast[9],
              november: monthlyForecast[10],
              december: monthlyForecast[11],
              total: totalForecast
            };
            
            const actualEntry = {
              category: categoryName,
              january: monthlyActual[0],
              february: monthlyActual[1],
              march: monthlyActual[2],
              april: monthlyActual[3],
              may: monthlyActual[4],
              june: monthlyActual[5],
              july: monthlyActual[6],
              august: monthlyActual[7],
              september: monthlyActual[8],
              october: monthlyActual[9],
              november: monthlyActual[10],
              december: monthlyActual[11],
              total: totalActual
            };
            
            forecastData.push(forecastEntry);
            actualData.push(actualEntry);

            // Create budget data entry
            const budgetEntry: BudgetData = {
              id: `budget-${accountId}`,
              code: accountCode,
              category: categoryName,
              type: type === 'Receita' ? 'revenue' : 'expense',
              actual: monthlyActual[2], // March as current month
              forecast: monthlyForecast[2],
              budgeted: monthlyForecast[2],
              accountType: 'analytical',
              level: 1
            };
            budgetData.push(budgetEntry);

            validRows++;
            accountId++;
          }

          if (validRows === 0) {
            // Add failed import to history
            const historyEntry: ImportHistory = {
              id: `import-${Date.now()}`,
              type: 'database',
              fileName: file.name,
              timestamp: new Date().toISOString(),
              status: 'error',
              recordCount: 0
            };
            dataStore.addImportHistory(historyEntry);

            resolve({
              success: false,
              message: '🚫 Nenhum dado válido encontrado para importar. Verifique se o arquivo contém dados válidos.',
              syntheticGroups: 0,
              analyticalAccounts: 0,
              errors: ['Nenhuma linha de dados válida encontrada']
            });
            return;
          }

          // Check for blocking errors
          const blockingErrors = errors.filter(error => 
            error.includes('❌')
          );

          if (blockingErrors.length > 0) {
            // Add failed import to history
            const historyEntry: ImportHistory = {
              id: `import-${Date.now()}`,
              type: 'database',
              fileName: file.name,
              timestamp: new Date().toISOString(),
              status: 'error',
              recordCount: 0
            };
            dataStore.addImportHistory(historyEntry);

            resolve({
              success: false,
              message: `🚫 Importação bloqueada: ${blockingErrors.length} erro(s) encontrado(s). Corrija os problemas abaixo e tente novamente:`,
              syntheticGroups: 0,
              analyticalAccounts: 0,
              errors: blockingErrors
            });
            return;
          }

          const totalRevenue = budgetData
            .filter(item => item.type === 'revenue')
            .reduce((sum, item) => sum + item.actual, 0);
          
          const totalExpenses = budgetData
            .filter(item => item.type === 'expense')
            .reduce((sum, item) => sum + item.actual, 0);

          const generatedKPIData: KPICard[] = [
            {
              title: 'Receita Total',
              forecast: totalRevenue,
              actual: totalRevenue,
              previousMonth: totalRevenue * 0.95,
              type: 'revenue'
            },
            {
              title: 'Despesas Totais',
              forecast: totalExpenses,
              actual: totalExpenses,
              previousMonth: totalExpenses * 1.05,
              type: 'expense'
            },
            {
              title: 'Saldo Final',
              forecast: totalRevenue - totalExpenses,
              actual: totalRevenue - totalExpenses,
              previousMonth: (totalRevenue * 0.95) - (totalExpenses * 1.05),
              type: 'balance'
            }
          ];

          // Store all imported data
          dataStore.setChartOfAccounts(accounts);
          dataStore.setForecastData(forecastData);
          dataStore.setActualData(actualData);
          dataStore.setRawImportData(jsonData, file.name); // Store raw data under file name
          
          // Generate KPI data from imported structure (default to September - index 8)
          const kpiDataFromImport = this.generateKPIFromImportedData(jsonData, 8);
          dataStore.setKPIData(kpiDataFromImport.length > 0 ? kpiDataFromImport : generatedKPIData);
          dataStore.setBudgetData(budgetData);

          // Add to import history
          const historyEntry: ImportHistory = {
            id: `import-${Date.now()}`,
            type: 'database',
            fileName: file.name,
            timestamp: new Date().toISOString(),
            status: 'success',
            recordCount: validRows
          };
          dataStore.addImportHistory(historyEntry);

          let successMessage = `✅ Base de dados importada com sucesso! ${validRows} categorias processadas.`;
          if (skippedRows.length > 0) {
            successMessage += ` ${skippedRows.length} linhas ignoradas (valores vazios/nulos).`;
          }

          // Add skipped rows information to success message
          const successErrors: string[] = [];
          if (skippedRows.length > 0) {
            const skippedRowsList = skippedRows.slice(0, 10).join(', ');
            const moreSkipped = skippedRows.length > 10 ? ` e mais ${skippedRows.length - 10}` : '';
            successErrors.push(`ℹ️ LINHAS IGNORADAS (valores vazios/nulos): ${skippedRowsList}${moreSkipped}`);
          }
          
          resolve({
            success: true,
            message: successMessage,
            syntheticGroups: 24, // 12 months x 2 (forecast + actual)
            analyticalAccounts: validRows,
            errors: successErrors.length > 0 ? successErrors : undefined
          });

          // Persist dataset remotely (Supabase) without blocking UI
          try {
            // @ts-ignore
            (DataService.instance as any)?.upsertDatasetRemote?.(file.name, jsonData);
          } catch {}

        } catch (error) {
          // Add failed import to history
          const historyEntry: ImportHistory = {
            id: `import-${Date.now()}`,
            type: 'database',
            fileName: file.name,
            timestamp: new Date().toISOString(),
            status: 'error',
            recordCount: 0
          };
          dataStore.addImportHistory(historyEntry);

          resolve({
            success: false,
            message: `Import failed: ${error}`,
            syntheticGroups: 0,
            analyticalAccounts: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error']
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Validate Conta Azul file structure
  private validateContaAzulStructure(jsonData: any[][], header: string[], fileName: string): void {
    // Expected structure for Conta Azul format (27 columns total)
    // Row 1: Headers
    // Row 2: May be empty or contain additional info
    // Row 3+: Account data (Category names + monthly values)
    
    // Validate header structure
    if (header.length < 27) {
      // Permitir formatos alternativos (mensal simplificado). Apenas avisar.
      console.warn(`Arquivo com ${header.length} colunas detectado. Tentando importar em modo simplificado (mensal).`);
      return;
    }

    // Validate column A header
    if (header[0] !== 'Categorias') {
      console.warn(`Coluna A (posição 1): Esperado "Categorias", encontrado "${header[0] || 'vazio'}". Continuando com importação...`);
    }
    
    // Validate alternating pattern for months (columns B-AA)
    const headerValidationErrors: string[] = [];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    for (let i = 1; i < 25; i += 2) { // Process pairs B-Y (24 columns for 12 months)
      const monthIndex = Math.floor((i - 1) / 2);
      const monthName = monthNames[monthIndex];
      
      const expectedForecastHeader = `${monthName} Previsto`;
      const expectedActualHeader = `${monthName} Realizado`;
      
      const forecastHeader = header[i]?.trim();
      const actualHeader = header[i + 1]?.trim();
      
      // More flexible header validation - check for key terms
      if (forecastHeader && !forecastHeader.toLowerCase().includes('previsto')) {
        const columnLetter = String.fromCharCode(65 + i);
        headerValidationErrors.push(`Coluna ${columnLetter} (${monthName}): Esperado conter "Previsto", encontrado "${forecastHeader}"`);
      }
      
      if (actualHeader && !actualHeader.toLowerCase().includes('realizado')) {
        const columnLetter = String.fromCharCode(65 + i + 1);
        headerValidationErrors.push(`Coluna ${columnLetter} (${monthName}): Esperado conter "Realizado", encontrado "${actualHeader}"`);
      }
    }

    // Validate remaining columns (Z, AA) - can be flexible
    for (let i = 25; i < 27; i++) {
      const actualHeader = header[i]?.trim();
      if (actualHeader && !actualHeader.toLowerCase().includes('previsto') && !actualHeader.toLowerCase().includes('realizado')) {
        const columnLetter = i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`;
        console.warn(`Coluna ${columnLetter}: Cabeçalho não reconhecido "${actualHeader}"`);
      }
    }

    if (headerValidationErrors.length > 0) {
      console.warn(`Avisos de cabeçalho: ${headerValidationErrors.join('; ')}`);
    }
  }

  // Generate KPI data from imported Conta Azul structure
  private generateKPIFromImportedData(jsonData: any[][], currentMonthIndex: number = 2): KPICard[] {
    const kpiData: KPICard[] = [];
    
    try {
      // Helper function to parse currency values
      const parseCurrency = (value: string | number): number => {
        if (typeof value === 'number') return value;
        const cleanValue = String(value || '0').replace(/[^\d.-]/g, '');
        return parseFloat(cleanValue) || 0;
      };

      // Helper function to find row by category name
      const findRowByCategory = (searchTerm: string): any[] | null => {
        for (let i = 3; i < jsonData.length; i++) { // Include row 4 (index 3) where Total de Recebimentos costuma estar
          const row = jsonData[i] as any[];
          const categoryName = String(row[0] || '').trim().toLowerCase();
          if (categoryName.includes(searchTerm.toLowerCase())) {
            return row;
          }
        }
        return null;
      };

      // Get column indices for current month (B=1, C=2 for January, D=3, E=4 for February, etc.)
      const forecastColIndex = 1 + (currentMonthIndex * 2); // B, D, F, H, J, L, N, P, R, T, V, X
      const actualColIndex = 2 + (currentMonthIndex * 2);   // C, E, G, I, K, M, O, Q, S, U, W, Y
      
      // Previous month indices
      const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
      const prevForecastColIndex = 1 + (prevMonthIndex * 2);
      const prevActualColIndex = 2 + (prevMonthIndex * 2);

      // KPI 1: Saldo do Mês Anterior (Row 3, from Column B onward)
      if (jsonData.length > 2) {
        const saldoRow = jsonData[2] as any[]; // Row 3 (index 2)
        const saldoForecast = parseCurrency(saldoRow[forecastColIndex]);
        const saldoActual = parseCurrency(saldoRow[actualColIndex]);
        const saldoPrevious = parseCurrency(saldoRow[prevActualColIndex]);
        
        kpiData.push({
          title: 'Saldo do Mês Anterior',
          forecast: saldoActual, // use Realizado always
          actual: saldoActual,   // Realizado
          previousMonth: saldoPrevious,
          type: 'balance'
        });
      }

      // KPI 2: Total Recebimentos (usar o mesmo dado do Fluxo de Caixa)
      // Preferir a linha "Total de Recebimentos"; se não existir, usar "Receitas Diretas" (com variações)
      const totalRecebimentosRow =
        findRowByCategory('Total de Recebimentos') ||
        findRowByCategory('Total Recebimentos') ||
        findRowByCategory('Total de Recebimento') ||
        findRowByCategory('Total Recebimento');
      const receitasDiretasRow =
        findRowByCategory('3.01 Receitas de Vendas e de Serviços') ||
        findRowByCategory('Receitas de Vendas e Serviços') ||
        findRowByCategory('Receitas Diretas') ||
        findRowByCategory('Receita Direta');

      if (totalRecebimentosRow || receitasDiretasRow) {
        const baseRow = totalRecebimentosRow || receitasDiretasRow as any[];
        const recebimentosForecast = parseCurrency(baseRow[forecastColIndex]);
        const recebimentosActual = parseCurrency(baseRow[actualColIndex]);
        const recebimentosPrevious = parseCurrency(baseRow[prevActualColIndex]);

        kpiData.push({
          title: 'Total Recebimentos',
          forecast: recebimentosActual, // Realizado
          actual: recebimentosActual,   // Realizado
          previousMonth: recebimentosPrevious,
          type: 'revenue'
        });
      }

      // KPI 3: CMV/CSP/CPV (Find row containing "4.01 Despesas com Vendas e Serviços")
      const cmvRow = findRowByCategory('4.01 Despesas com Vendas e Serviços');
      if (cmvRow) {
        const cmvForecast = parseCurrency(cmvRow[forecastColIndex]);
        const cmvActual = parseCurrency(cmvRow[actualColIndex]);
        const cmvPrevious = parseCurrency(cmvRow[prevActualColIndex]);
        
        kpiData.push({
          title: 'CMV/CSP/CPV',
          forecast: cmvActual, // Realizado
          actual: cmvActual,   // Realizado
          previousMonth: cmvPrevious,
          type: 'expense'
        });
      }

      // KPI 4: Total de Pagamentos (Find row containing "Total de Pagamentos")
      const pagamentosRow = findRowByCategory('Total de Pagamentos');
      if (pagamentosRow) {
        const pagamentosForecast = parseCurrency(pagamentosRow[forecastColIndex]);
        const pagamentosActual = parseCurrency(pagamentosRow[actualColIndex]);
        const pagamentosPrevious = parseCurrency(pagamentosRow[prevActualColIndex]);
        
        kpiData.push({
          title: 'Total de Pagamentos',
          forecast: pagamentosActual, // Realizado
          actual: pagamentosActual,   // Realizado
          previousMonth: pagamentosPrevious,
          type: 'expense'
        });
      }

      // KPI 5: Saldo Final de Caixa (match fluxo)
      const saldoFinalRowGen =
        findRowByCategory('Saldo Final de Caixa') ||
        findRowByCategory('Saldo Final') ||
        findRowByCategory('Saldo Final Líquido (Caixa)');
      if (saldoFinalRowGen) {
        const saldoForecast = parseCurrency(saldoFinalRowGen[forecastColIndex]);
        const saldoActual = parseCurrency(saldoFinalRowGen[actualColIndex]);
        const saldoPrevious = parseCurrency(saldoFinalRowGen[prevActualColIndex]);
        kpiData.push({
          title: 'Saldo Final de Caixa',
          forecast: saldoForecast,
          actual: saldoActual,
          previousMonth: saldoPrevious,
          type: 'balance'
        });
      }

      // KPI 6: Margem Líquida (Complex calculation)
      const receitasVendasRow = findRowByCategory('3.01 Receitas de Vendas e de Serviços');
      
      if (receitasVendasRow) {
        const receitaVendasForecast = parseCurrency(receitasVendasRow[forecastColIndex]);
        const receitaVendasActual = parseCurrency(receitasVendasRow[actualColIndex]);
        const receitaVendasPrevious = parseCurrency(receitasVendasRow[prevActualColIndex]);
        
        // Calculate total expenses from multiple categories
        const expenseCategories = [
          '4.01 Despesas com Vendas e Serviços',
          '4.02 Impostos sobre Vendas, Serviços e Lucro',
          '4.03 Despesa com Pessoal',
          '4.04 Despesas Diretas',
          '4.05 Despesas Administrativas',
          '4.06 Despesas com Funcionamento',
          '4.07 Despesas Comerciais',
          '4.08 Despesas Financeiras',
          '4.10 Despesa com Pessoal – Indireto',
          '4.12 Despesas Financeiras – Variáveis'
        ];
        
        let totalExpensesForecast = 0;
        let totalExpensesActual = 0;
        let totalExpensesPrevious = 0;
        
        expenseCategories.forEach(category => {
          const expenseRow = findRowByCategory(category);
          if (expenseRow) {
            totalExpensesForecast += parseCurrency(expenseRow[forecastColIndex]);
            totalExpensesActual += parseCurrency(expenseRow[actualColIndex]);
            totalExpensesPrevious += parseCurrency(expenseRow[prevActualColIndex]);
          }
        });
        
        // Calculate net margin
        const margemForecast = receitaVendasActual - totalExpensesActual; // Realizado
        const margemActual = receitaVendasActual - totalExpensesActual;   // Realizado
        const margemPrevious = receitaVendasPrevious - totalExpensesPrevious;
        
        kpiData.push({
          title: 'Margem Líquida',
          forecast: margemForecast,
          actual: margemActual,
          previousMonth: margemPrevious,
          type: 'balance',
          marginPercentage: receitaVendasActual > 0 ? (margemActual / receitaVendasActual) * 100 : 0,
          expectedMargin: 15 // Expected Net Margin = 15%
        });
      }
      
    } catch (error) {
      console.error('Error generating KPI data:', error);
    }
    
    return kpiData;
  }

  // Update KPI data for a selected period (sum across months) while preserving other KPIs
  updateKPIDataForPeriod(startMonthIndex: number, endMonthIndex: number): void {
    const rawData = this.getRawImportData();
    if (!rawData || rawData.length === 0) return;

    // Start from base KPIs for the end month to keep other cards consistent (values will be Realizado)
    const baseKPI = this.generateKPIFromImportedData(rawData, endMonthIndex);

    // Helpers
    const parseCurrency = (value: string | number): number => {
      if (typeof value === 'number') return value;
      const cleanValue = String(value || '0').replace(/[^\d.-]/g, '');
      return parseFloat(cleanValue) || 0;
    };

    const sumRange = (row: any[], start: number, end: number) => {
      let forecast = 0;
      let actual = 0;
      for (let monthIndex = start; monthIndex <= end; monthIndex++) {
        const forecastColIndex = 1 + (monthIndex * 2);
        const actualColIndex = 2 + (monthIndex * 2);
        forecast += parseCurrency(row[forecastColIndex]);
        actual += parseCurrency(row[actualColIndex]);
      }
      return { forecast, actual };
    };

    const findRowByCategory = (searchTerm: string): any[] | null => {
      for (let i = 3; i < rawData.length; i++) { // include row 4 (index 3)
        const row = rawData[i] as any[];
        const categoryName = String(row[0] || '').trim().toLowerCase();
        if (categoryName.includes(searchTerm.toLowerCase())) {
          return row;
        }
      }
      return null;
    };

    let nextKPI = [...baseKPI];

    // Total de Recebimentos (match fluxo)
    const totalRecebimentosRow =
      findRowByCategory('Total de Recebimentos') ||
      findRowByCategory('Total Recebimentos') ||
      findRowByCategory('Total de Recebimento') ||
      findRowByCategory('Total Recebimento');
    const receitasDiretasRow =
      findRowByCategory('3.01 Receitas de Vendas e de Serviços') ||
      findRowByCategory('Receitas de Vendas e Serviços') ||
      findRowByCategory('Receitas Diretas') ||
      findRowByCategory('Receita Direta');

    if (totalRecebimentosRow || receitasDiretasRow) {
      const baseRow = (totalRecebimentosRow || receitasDiretasRow) as any[];
      const { forecast, actual } = sumRange(baseRow, startMonthIndex, endMonthIndex);
      let previousMonth = 0;
      if (startMonthIndex > 0) {
        const prevStart = Math.max(0, startMonthIndex - 1);
        const prevEnd = Math.max(prevStart, endMonthIndex - 1);
        previousMonth = sumRange(baseRow, prevStart, prevEnd).actual;
      }
      nextKPI = nextKPI.map(kpi =>
        kpi.title === 'Total Recebimentos'
          ? { ...kpi, forecast: actual, actual, previousMonth }
          : kpi
      );
      if (!nextKPI.some(k => k.title === 'Total Recebimentos')) {
        nextKPI = [
          ...nextKPI,
          { title: 'Total Recebimentos', forecast: actual, actual, previousMonth, type: 'revenue' } as KPICard,
        ];
      }
    }

    // Total de Pagamentos (match fluxo)
    const totalPagamentosRow =
      findRowByCategory('Total de Pagamentos') ||
      findRowByCategory('Total Pagamentos') ||
      findRowByCategory('Total de Pagamento') ||
      findRowByCategory('Total Pagamento');
    if (totalPagamentosRow) {
      const { forecast, actual } = sumRange(totalPagamentosRow, startMonthIndex, endMonthIndex);
      let previousMonth = 0;
      if (startMonthIndex > 0) {
        const prevStart = Math.max(0, startMonthIndex - 1);
        const prevEnd = Math.max(prevStart, endMonthIndex - 1);
        previousMonth = sumRange(totalPagamentosRow, prevStart, prevEnd).actual;
      }
      nextKPI = nextKPI.map(kpi =>
        kpi.title === 'Total de Pagamentos'
          ? { ...kpi, forecast: actual, actual, previousMonth }
          : kpi
      );
      if (!nextKPI.some(k => k.title === 'Total de Pagamentos')) {
        nextKPI = [
          ...nextKPI,
          { title: 'Total de Pagamentos', forecast: actual, actual, previousMonth, type: 'expense' } as KPICard,
        ];
      }
    }

    // Saldo Final de Caixa (match fluxo)
    const saldoFinalRow =
      findRowByCategory('Saldo Final de Caixa') ||
      findRowByCategory('Saldo Final') ||
      findRowByCategory('Saldo Final Líquido (Caixa)');
    if (saldoFinalRow) {
      const { forecast, actual } = sumRange(saldoFinalRow, startMonthIndex, endMonthIndex);
      let previousMonth = 0;
      if (startMonthIndex > 0) {
        const prevStart = Math.max(0, startMonthIndex - 1);
        const prevEnd = Math.max(prevStart, endMonthIndex - 1);
        previousMonth = sumRange(saldoFinalRow, prevStart, prevEnd).actual;
      }
      nextKPI = nextKPI.map(kpi =>
        (kpi.title === 'Saldo Final de Caixa' || kpi.title === 'Saldo Final')
          ? { ...kpi, forecast: actual, actual, previousMonth, type: 'balance' as const }
          : kpi
      );
      if (!nextKPI.some(k => k.title === 'Saldo Final de Caixa' || k.title === 'Saldo Final')) {
        nextKPI = [
          ...nextKPI,
          { title: 'Saldo Final de Caixa', forecast: actual, actual, previousMonth, type: 'balance' } as KPICard,
        ];
      }
    }

    // Save final KPIs
    (DataService as any).instance && dataStore.setKPIData(nextKPI);
  }

  // Generate account code from category name
  private generateAccountCode(categoryName: string, id: number): string {
    // Simple account code generation based on category type
    const name = categoryName.toLowerCase();
    
    if (name.includes('receita') || name.includes('vendas') || name.includes('faturamento')) {
      return `3.01.${String(id).padStart(3, '0')}`;
    } else if (name.includes('custo') || name.includes('cpv') || name.includes('cmv')) {
      return `4.01.${String(id).padStart(3, '0')}`;
    } else if (name.includes('despesa') || name.includes('gasto')) {
      return `4.02.${String(id).padStart(3, '0')}`;
    } else {
      return `5.01.${String(id).padStart(3, '0')}`;
    }
  }

  // Infer account type from category name
  private inferAccountTypeFromName(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    if (name.includes('receita') || name.includes('vendas') || name.includes('faturamento')) {
      return 'Receita';
    } else if (name.includes('custo') || name.includes('cpv') || name.includes('cmv') || 
               name.includes('despesa') || name.includes('gasto')) {
      return 'Despesa';
    } else {
      return 'Despesa'; // Default
    }
  }

  // Helper method to infer account type from account code
  private inferAccountType(accountCode: string): string {
    // Basic inference based on account code patterns
    if (accountCode.startsWith('3.')) return 'Receita';
    if (accountCode.startsWith('4.')) return 'Despesa';
    if (accountCode.startsWith('1.')) return 'Ativo';
    if (accountCode.startsWith('2.')) return 'Passivo';
    return 'Despesa'; // Default
  }
  // Remove old import methods
  async importChartOfAccounts(file: File): Promise<ImportResult> {
    return {
      success: false,
      message: 'Chart of Accounts import is no longer supported. Use Conta Azul database import instead.',
      syntheticGroups: 0,
      analyticalAccounts: 0,
      errors: ['This import method has been deprecated']
    };
  }

  async importForecast(file: File): Promise<ImportResult> {
    return {
      success: false,
      message: 'Forecast import is no longer supported. Use Conta Azul database import instead.',
      syntheticGroups: 0,
      analyticalAccounts: 0,
      errors: ['This import method has been deprecated']
    };
  }

  async importActuals(file: File): Promise<ImportResult> {
    return {
      success: false,
      message: 'Actuals import is no longer supported. Use Conta Azul database import instead.',
      syntheticGroups: 0,
      analyticalAccounts: 0,
      errors: ['This import method has been deprecated']
    };
  }

  // Data retrieval methods
  getChartOfAccounts(): ChartOfAccount[] {
    return dataStore.getChartOfAccounts();
  }

  getActualData(): any[] {
    return dataStore.getActualData();
  }

  getKPIData(): KPICard[] {
    return dataStore.getKPIData();
  }

  getBudgetData(): BudgetData[] {
    return dataStore.getBudgetData();
  }

  getImportHistory(): ImportHistory[] {
    return dataStore.getImportHistory();
  }

  getResetLogs(): ResetLog[] {
    return dataStore.getResetLogs();
  }

  // Multiple dataset helpers
  getDatasetNames(): string[] {
    // @ts-ignore
    return (dataStore as any).getDatasetNames ? (dataStore as any).getDatasetNames() : [];
  }

  getActiveDatasetName(): string | null {
    // @ts-ignore
    return (dataStore as any).getActiveDatasetName ? (dataStore as any).getActiveDatasetName() : null;
  }

  // Auth helpers (frontend-only)
  getAuthUser(): { username: string; role: 'cfsmart' | 'lamole' } | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = (window as any).__auth_user__;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  login(username: string, password: string): { success: boolean; role?: 'cfsmart' | 'lamole'; message?: string } {
    const pairs: Record<string, { password: string; role: 'cfsmart' | 'lamole' }> = {
      'cfsmart': { password: 'soubotafogo', role: 'cfsmart' },
      'lamole': { password: 'lamole2025', role: 'lamole' }
    };
    const entry = pairs[username.toLowerCase()];
    if (!entry) return { success: false, message: 'Usuário não encontrado' };
    if (entry.password !== password) return { success: false, message: 'Senha incorreta' };
    try { if (typeof window !== 'undefined') (window as any).__auth_user__ = JSON.stringify({ username, role: entry.role }); } catch {}
    return { success: true, role: entry.role };
  }

  logout(): void {
    try { if (typeof window !== 'undefined') delete (window as any).__auth_user__; } catch {}
  }

  hasImportAccess(): boolean {
    const u = this.getAuthUser();
    return !!u && u.role === 'cfsmart';
  }

  // Supabase dataset sync
  async syncLoadDatasets(): Promise<void> {
    if (!this.supabase) {
      try { (this as any).supabase = getSupabaseClient(); } catch {}
    }
    if (!this.supabase) {
      try { console.warn('Supabase não configurado: verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, e reinicie o dev server.'); } catch {}
      return;
    }
    const { data, error } = await (this.supabase as SupabaseClient)
      .from('datasets')
      .select('name, content')
      .order('inserted_at', { ascending: true });
    if (error) {
      try { console.error('Erro ao carregar datasets do Supabase:', error.message || error); } catch {}
      return;
    }
    (dataStore as any).clearRawImportData();
    for (const row of (data as any[])) {
      try {
        const parsed = JSON.parse(row.content || '[]');
        if (Array.isArray(parsed)) (dataStore as any).setRawImportData(parsed, row.name);
      } catch {}
    }
  }

  async upsertDatasetRemote(name: string, content: any[][]): Promise<void> {
    if (!this.supabase) {
      try { (this as any).supabase = getSupabaseClient(); } catch {}
    }
    if (!this.supabase) {
      (dataStore as any).setRawImportData(content, name);
      try {
        console.warn('Supabase não configurado: dataset salvo apenas em memória. hasSupabaseConfig=', hasSupabaseConfig());
      } catch {}
      return;
    }
    (dataStore as any).setRawImportData(content, name);
    try {
      const { error } = await (this.supabase as SupabaseClient)
        .from('datasets')
        .upsert({ name, content: JSON.stringify(content) }, { onConflict: 'name' });
      if (error) {
        try { console.error('Erro ao salvar dataset no Supabase:', error.message || error); } catch {}
      }
    } catch (err: any) {
      try { console.error('Exceção no upsert do Supabase:', err?.message || err); } catch {}
    }
  }

  setActiveDataset(name: string): void {
    // @ts-ignore
    if ((dataStore as any).setActiveDataset) {
      // @ts-ignore
      (dataStore as any).setActiveDataset(name);
    }
  }

  // Delete individual import
  deleteImport(importId: string): { success: boolean; message: string } {
    try {
      dataStore.deleteImportById(importId);
      return { success: true, message: 'Import deleted successfully' };
    } catch (error) {
      return { success: false, message: `Failed to delete import: ${error}` };
    }
  }

  // Public setter methods for loading sample data
  setChartOfAccounts(accounts: ChartOfAccount[]): void {
    dataStore.setChartOfAccounts(accounts);
  }

  setForecastData(data: any[]): void {
    dataStore.setForecastData(data);
  }

  setActualData(data: any[]): void {
    dataStore.setActualData(data);
  }

  setKPIData(data: KPICard[]): void {
    dataStore.setKPIData(data);
  }

  setBudgetData(data: BudgetData[]): void {
    dataStore.setBudgetData(data);
  }

  addImportHistory(entry: ImportHistory): void {
    dataStore.addImportHistory(entry);
  }

  // Update KPI data for specific month
  updateKPIDataForMonth(monthIndex: number): void {
    const rawData = dataStore.getRawImportData();
    if (rawData && rawData.length > 0) {
      const kpiData = this.generateKPIFromImportedData(rawData, monthIndex);
      dataStore.setKPIData(kpiData);
    }
  }

  // Check if system is empty
  isEmpty(): boolean {
    return dataStore.isEmpty();
  }

  // Get raw import data
  getRawImportData(): any[][] | null {
    return dataStore.getRawImportData();
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();