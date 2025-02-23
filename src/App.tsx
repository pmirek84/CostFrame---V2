import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NotificationsPanel from './components/NotificationsPanel';
import Dashboard from './components/Dashboard';
import Offers from './components/Offers';
import OfferTemplates from './components/OfferTemplates';
import Orders from './components/Orders';
import Clients from './components/Clients';
import Calendar from './components/Calendar';
import Analysis from './components/Analysis';
import CostTable from './components/CostTable';
import InstallationRates from './components/InstallationRates';
import InstallationStandards from './components/InstallationStandards/StandardsManager';
import LogisticsCosts from './components/LogisticsCosts';
import RentalCosts from './components/RentalCosts';
import ImportData from './components/ImportData';
import SheetMetal from './components/SheetMetal';
import CompanySettings from './components/CompanySettings';
import CRM from './components/CRM';
import Invoices from './components/Invoices';
import { CalendarProvider } from './contexts/CalendarContext';
import { AuthProvider } from './contexts/AuthContext';

type View = 'dashboard' | 'crm' | 'offers' | 'offer-templates' | 'orders' | 'clients' | 'calendar' | 'analysis' | 'settings' |
           'materials' | 'tools' | 'logistics' | 'rental' | 'import' | 'installation-rates' | 
           'installation-standards' | 'sheet-metal' | 'company-settings' | 'invoices';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  // Define views where notifications panel should be hidden
  const hideNotificationsViews = [
    'dashboard',
    'materials',
    'installation-rates',
    'installation-standards',
    'logistics',
    'rental',
    'sheet-metal',
    'import',
    'invoices'
  ];

  const shouldShowNotifications = !hideNotificationsViews.includes(activeView);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CRM />;
      case 'offers':
        return <Offers />;
      case 'offer-templates':
        return <OfferTemplates />;
      case 'orders':
        return <Orders />;
      case 'clients':
        return <Clients />;
      case 'calendar':
        return <Calendar />;
      case 'analysis':
        return <Analysis />;
      case 'materials':
        return <CostTable />;
      case 'installation-rates':
        return <InstallationRates />;
      case 'installation-standards':
        return <InstallationStandards />;
      case 'logistics':
        return <LogisticsCosts />;
      case 'rental':
        return <RentalCosts />;
      case 'sheet-metal':
        return <SheetMetal />;
      case 'import':
        return <ImportData />;
      case 'company-settings':
        return <CompanySettings />;
      case 'invoices':
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <CalendarProvider>
        <div className="min-h-screen bg-[#F8F9FA]">
          <Header 
            activeView={activeView} 
            onViewChange={setActiveView}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleNotifications={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
          />
          
          <div className="flex relative">
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <Sidebar activeView={activeView} onViewChange={setActiveView} />
            </div>

            <main className={`flex-1 p-6 transition-all duration-200 ${shouldShowNotifications ? 'lg:mr-80' : ''}`}>
              <div className="max-w-7xl mx-auto">
                {renderView()}
              </div>
            </main>

            {shouldShowNotifications && (
              <div className={`
                fixed top-16 right-0 bottom-0 w-80 bg-white border-l border-gray-200
                transform transition-transform duration-200 ease-in-out z-50
                ${isNotificationsPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                lg:translate-x-0 lg:static lg:transform-none
              `}>
                <NotificationsPanel />
              </div>
            )}
          </div>
        </div>
      </CalendarProvider>
    </AuthProvider>
  );
}