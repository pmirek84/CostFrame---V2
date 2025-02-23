import React, { useState } from 'react';
import { 
  FileText, 
  Wrench, 
  Truck, 
  Settings, 
  Timer, 
  Plus, 
  DollarSign, 
  Upload, 
  Hammer, 
  ChevronDown, 
  ChevronRight, 
  LayoutDashboard, 
  FileEdit, 
  ClipboardList, 
  Calendar as CalendarIcon,
  Copy,
  Scissors,
  Building2,
  HeartHandshake,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const mainNavItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', name: 'CRM', icon: HeartHandshake },
  { id: 'offers', name: 'Oferty', icon: FileEdit },
  { id: 'offer-templates', name: 'Wzory ofert', icon: Copy },
  { id: 'orders', name: 'Zlecenia', icon: ClipboardList },
  { id: 'calendar', name: 'Kalendarz', icon: CalendarIcon },
  { id: 'invoices', name: 'Faktury', icon: Receipt }
];

const costCategories = [
  { id: 'materials', name: 'Koszty materiałów montażowych', icon: FileText },
  { id: 'installation-standards', name: 'Standardy Montażu', icon: Wrench },
  { id: 'installation-rates', name: 'Stawki montażu', icon: Hammer },
  { id: 'logistics', name: 'Koszty logistyki', icon: Truck },
  { id: 'rental', name: 'Koszty wynajmu sprzętu', icon: Timer },
  { id: 'sheet-metal', name: 'Obróbki blacharskie', icon: Scissors },
  { id: 'import', name: 'Import danych', icon: Upload }
];

const settingsItems = [
  { id: 'company-settings', name: 'Dane firmy', icon: Building2 }
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCostsExpanded, setIsCostsExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {mainNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-gray-700 hover:bg-[#ECF0F1]'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${
                    activeView === item.id ? 'text-white' : 'text-gray-500'
                  }`} />
                  <span className="text-sm">{item.name}</span>
                </button>
              </li>
            );
          })}

          <li className="pt-4">
            <button
              onClick={() => setIsCostsExpanded(!isCostsExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-[#ECF0F1] rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Koszty</span>
              </div>
              {isCostsExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {isCostsExpanded && (
              <ul className="mt-2 ml-4 space-y-1">
                {costCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <li key={category.id}>
                      <button
                        onClick={() => onViewChange(category.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                          activeView === category.id
                            ? 'bg-[#1E3A8A] text-white'
                            : 'text-gray-700 hover:bg-[#ECF0F1]'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${
                          activeView === category.id ? 'text-white' : 'text-gray-500'
                        }`} />
                        <span className="text-sm">{category.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          <li className="pt-4">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-[#ECF0F1] rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Ustawienia</span>
              </div>
              {isSettingsExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {isSettingsExpanded && (
              <ul className="mt-2 ml-4 space-y-1">
                {settingsItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                          activeView === item.id
                            ? 'bg-[#1E3A8A] text-white'
                            : 'text-gray-700 hover:bg-[#ECF0F1]'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${
                          activeView === item.id ? 'text-white' : 'text-gray-500'
                        }`} />
                        <span className="text-sm">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}