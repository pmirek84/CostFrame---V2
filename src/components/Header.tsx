import React from 'react';
import { 
  Menu,
  Bell,
  Search, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
}

export default function Header({ 
  activeView, 
  onViewChange,
  onToggleSidebar, 
  onToggleNotifications 
}: HeaderProps) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'offers', label: 'Oferty' },
    { id: 'orders', label: 'Zlecenia' },
    { id: 'calendar', label: 'Kalendarz' }
  ];

  // Load company settings from localStorage
  const companySettings = (() => {
    try {
      const settings = localStorage.getItem('company_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading company settings:', error);
      return null;
    }
  })();

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Lewa strona */}
          <div className="flex items-center">
            <button 
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4 ml-4">
              {/* Company Logo */}
              {companySettings?.logo && (
                <img 
                  src={companySettings.logo} 
                  alt={companySettings.name}
                  className="h-8 w-auto"
                />
              )}
              
              {/* Separator */}
              {companySettings?.logo && (
                <div className="h-8 w-px bg-gray-200"></div>
              )}
              
              {/* CostFRAME Logo */}
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-8 w-8 text-[#1E3A8A]" />
                <span className="text-xl font-semibold text-[#1E3A8A] hidden sm:block">
                  CostFRAME
                </span>
              </div>
            </div>
          </div>

          {/* Środek - główna nawigacja */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === item.id
                    ? 'text-[#1E3A8A] bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Prawa strona */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="h-5 w-5 text-gray-400" />
            </button>
            <button 
              onClick={onToggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell className="h-5 w-5 text-gray-400" />
            </button>
            <button 
              onClick={() => onViewChange('company-settings')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}