import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Clock, Users2, FileText, Calendar, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useCalendar, type CalendarEvent } from '../contexts/CalendarContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Sample data - replace with real data from your backend
const costSummary = {
  categories: [
    { name: 'Elementy złączne', total: 28.20 },
    { name: 'Materiały izolacyjne', total: 355.00 },
    { name: 'Materiały uszczelniające', total: 115.00 },
    { name: 'Materiały dodatkowe', total: 80.00 }
  ],
  averageCost: 32.89,
  highestCost: 120.00,
  lowestCost: 0.40,
  lastUpdate: '2024-01-15'
};

const monthlyData = {
  labels: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze'],
  datasets: [
    {
      label: 'Koszty materiałów',
      data: [300, 450, 380, 420, 390, 500],
      borderColor: '#1E3A8A',
      backgroundColor: 'rgba(30, 58, 138, 0.1)',
      fill: true,
    }
  ]
};

const categoryData = {
  labels: costSummary.categories.map(cat => cat.name),
  datasets: [
    {
      label: 'Koszty według kategorii',
      data: costSummary.categories.map(cat => cat.total),
      backgroundColor: [
        'rgba(30, 58, 138, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 197, 253, 0.8)',
        'rgba(191, 219, 254, 0.8)'
      ],
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

interface DashboardSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DASHBOARD_LAYOUT_KEY = 'dashboard_layout';

export default function Dashboard() {
  const { events } = useCalendar();
  const [sections, setSections] = useState<DashboardSection[]>(() => {
    const savedLayout = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
    return savedLayout ? JSON.parse(savedLayout) : [
      { id: 'summary', title: 'Podsumowanie kosztów', visible: true, order: 0 },
      { id: 'trends', title: 'Trendy i statystyki', visible: true, order: 1 },
      { id: 'upcoming', title: 'Nadchodzące wydarzenia', visible: true, order: 2 },
      { id: 'categories', title: 'Koszty według kategorii', visible: true, order: 3 }
    ];
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'trends', 'upcoming', 'categories']);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(sections));
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    setDraggedSection(sectionId);
    e.currentTarget.classList.add('opacity-50');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedSection(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    
    if (!draggedSection || draggedSection === targetId) return;

    setSections(prev => {
      const updatedSections = [...prev];
      const draggedIndex = updatedSections.findIndex(s => s.id === draggedSection);
      const targetIndex = updatedSections.findIndex(s => s.id === targetId);
      
      const [draggedItem] = updatedSections.splice(draggedIndex, 1);
      updatedSections.splice(targetIndex, 0, draggedItem);
      
      return updatedSections.map((section, index) => ({
        ...section,
        order: index
      }));
    });
  };

  // Get upcoming events for the next 7 days
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return eventDate >= now && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5); // Show only 5 most recent events

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return `Dziś, ${eventDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Jutro, ${eventDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return eventDate.toLocaleString('pl-PL', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Oferta':
        return 'bg-[#1E3A8A] text-white';
      case 'Zlecenie':
        return 'bg-[#27AE60] text-white';
      case 'Spotkanie':
        return 'bg-[#F1C40F] text-gray-900';
      case 'Montaż':
        return 'bg-[#8E44AD] text-white';
      default:
        return 'bg-[#95A5A6] text-white';
    }
  };

  const totalCost = costSummary.categories.reduce((sum, cat) => sum + cat.total, 0);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Dostosuj widok</h3>
          <div className="flex space-x-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => toggleSectionVisibility(section.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  section.visible
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Draggable Sections */}
      {sortedSections.map(section => section.visible && (
        <div
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, section.id)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, section.id)}
          className="bg-white rounded-lg shadow-sm overflow-hidden cursor-move"
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <GripVertical className="h-5 w-5 text-gray-400" />
              {section.id === 'summary' && <BarChart3 className="h-5 w-5 text-[#1E3A8A]" />}
              {section.id === 'trends' && <TrendingUp className="h-5 w-5 text-[#1E3A8A]" />}
              {section.id === 'upcoming' && <Calendar className="h-5 w-5 text-[#1E3A8A]" />}
              {section.id === 'categories' && <BarChart3 className="h-5 w-5 text-[#1E3A8A]" />}
              <h2 className="font-semibold text-gray-900">{section.title}</h2>
            </div>
            {expandedSections.includes(section.id) ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {/* Section Content */}
          {expandedSections.includes(section.id) && (
            <>
              {section.id === 'summary' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Średni koszt materiału</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{costSummary.averageCost.toFixed(2)} PLN</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Najdroższy materiał</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{costSummary.highestCost.toFixed(2)} PLN</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-900">Najtańszy materiał</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{costSummary.lowestCost.toFixed(2)} PLN</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Ostatnia aktualizacja</span>
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      {new Date(costSummary.lastUpdate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {section.id === 'trends' && (
                <div className="p-4">
                  <div className="h-64">
                    <Line data={monthlyData} options={chartOptions} />
                  </div>
                </div>
              )}

              {section.id === 'upcoming' && (
                <div className="p-4">
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map(event => (
                        <div 
                          key={event.id} 
                          className={`p-4 rounded-lg border-l-4 ${
                            event.priority === 'urgent' ? 'border-l-red-500 bg-red-50' :
                            event.priority === 'high' ? 'border-l-orange-500 bg-orange-50' :
                            event.priority === 'normal' ? 'border-l-blue-500 bg-blue-50' :
                            'border-l-gray-500 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                                {event.type}
                              </span>
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatEventDate(event.start)}
                            </span>
                          </div>
                          {event.client && (
                            <p className="text-sm text-gray-600">
                              Klient: {event.client}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-sm text-gray-600">
                              Miejsce: {event.location}
                            </p>
                          )}
                          {event.status && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                event.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {event.status === 'completed' ? 'Zakończone' :
                                 event.status === 'in-progress' ? 'W trakcie' :
                                 event.status === 'cancelled' ? 'Anulowane' :
                                 'Zaplanowane'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          Brak nadchodzących wydarzeń
                        </p>
                        <p>Dodaj nowe wydarzenia do kalendarza</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {section.id === 'categories' && (
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64">
                      <Bar data={categoryData} options={chartOptions} />
                    </div>
                    
                    <div className="space-y-4">
                      {costSummary.categories.map((category) => (
                        <div key={category.name} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{category.name}</span>
                            <span className="text-gray-900 font-semibold">{category.total.toFixed(2)} PLN</span>
                          </div>
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(category.total / totalCost) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}