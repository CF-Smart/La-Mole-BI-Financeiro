import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Calculator, 
  TrendingUp
} from 'lucide-react';
import Logo from '../La Mole.jpg';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'import', name: 'Importação de Dados', icon: Upload },
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulator', name: 'Simulador Orçamentário', icon: Calculator },
    { id: 'performance', name: 'Performance', icon: TrendingUp }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-12 w-12 mr-3 bg-white rounded-xl ring-2 ring-blue-300 shadow flex items-center justify-center">
                <img src={Logo} alt="La Mole" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">La Mole</h1>
                <p className="text-xs text-gray-600">Financial BI Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;