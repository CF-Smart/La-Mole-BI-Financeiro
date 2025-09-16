import React, { useState } from 'react';
import { loadSampleData } from './data/mockData';
import Sidebar from './components/Layout/Sidebar';
import DataImport from './pages/DataImport';
import Dashboard from './pages/Dashboard';
import BudgetSimulator from './pages/BudgetSimulator';
import Performance from './pages/Performance';
import Login from './pages/Login';
import { dataService } from './services/dataService';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [auth, setAuth] = useState(() => dataService.getAuthUser());

  // Load sample data on app initialization
  React.useEffect(() => {
    loadSampleData();
    // carregar datasets locais primeiro (fallback)
    try { (dataService as any)?.loadLocalDatasets?.(); } catch {}
    // tentar carregar datasets do Supabase
    (async () => {
      try { await (dataService as any).syncLoadDatasets?.(); } catch {}
    })();
  }, []);

  if (!auth) {
    return <Login onLogged={() => setAuth(dataService.getAuthUser())} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'import':
        if (!dataService.hasImportAccess()) return <Dashboard />;
        return <DataImport />;
      case 'dashboard':
        return <Dashboard />;
      case 'simulator':
        return <BudgetSimulator />;
      case 'performance':
        return <Performance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={() => { dataService.logout(); setAuth(null); }}
      />
      <main className="flex-1 flex flex-col">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;