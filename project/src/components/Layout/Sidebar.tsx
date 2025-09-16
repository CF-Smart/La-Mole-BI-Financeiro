import React from 'react';
import { dataService } from '../../services/dataService';
import { 
  LayoutDashboard, 
  Upload, 
  Calculator, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Logo from '../La Mole.jpg';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const user = dataService.getAuthUser();

  const hasImport = dataService.hasImportAccess();
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulator', name: 'Simulador', icon: Calculator },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    ...(hasImport ? [{ id: 'import', name: 'Importação', icon: Upload }] : [])
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col transition-all duration-300`}>
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-blue-800 relative`}>
        <div className="flex items-center">
          <div className={`${isCollapsed ? 'h-14 w-14' : 'h-14 w-14 mr-3'} bg-white rounded-xl ring-2 ring-blue-300 shadow flex items-center justify-center`}>
            <img src={Logo} alt="La Mole" className="h-12 w-12 object-contain" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">La Mole</h1>
              <p className="text-xs text-blue-300">Financial BI</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-600 rounded-full p-1.5 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <nav className="p-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-700 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {!isCollapsed && (
        <div className="p-3 border-t border-blue-800 space-y-2">
          {user && (
            <div className="text-[11px] text-blue-200">
              <div className="text-white font-semibold leading-tight">{user.username}</div>
              <div className="opacity-80 leading-tight">Perfil: {user.role === 'cfsmart' ? 'CFSmart' : 'La Mole'}</div>
            </div>
          )}
          <button
            onClick={() => onLogout && onLogout()}
            className="w-full flex items-center justify-center px-3 py-1.5 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
          <div className="text-[11px] text-blue-300 leading-tight">
            <p>v2.1.0 • © 2025 La Mole</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;