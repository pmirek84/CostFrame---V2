import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, Wrench } from 'lucide-react';
import type { RentalCost } from '../types';
import CostModal from './CostModal';

const initialRentalCosts: RentalCost[] = [
  {
    id: '1',
    name: 'Dźwig samojezdny',
    unit: 'dzień',
    unitPrice: 1200,
    category: 'Sprzęt ciężki',
    minRentalPeriod: '1 dzień',
    availability: 'na żądanie'
  },
  {
    id: '2',
    name: 'Podnośnik nożycowy',
    unit: 'dzień',
    unitPrice: 350,
    category: 'Podnośniki',
    minRentalPeriod: '1 dzień',
    availability: 'dostępny'
  }
];

export default function RentalCosts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<RentalCost | null>(null);
  const [costs, setCosts] = useState<RentalCost[]>(initialRentalCosts);

  const modalFields = [
    { name: 'name', label: 'Nazwa sprzętu', type: 'text', required: true },
    { name: 'unit', label: 'Jednostka czasu', type: 'select', options: ['godzina', 'dzień', 'tydzień', 'miesiąc'], required: true },
    { name: 'unitPrice', label: 'Cena za jednostkę (PLN)', type: 'number', required: true },
    {
      name: 'category',
      label: 'Kategoria',
      type: 'select',
      options: ['Sprzęt ciężki', 'Podnośniki', 'Rusztowania', 'Sprzęt transportowy', 'Narzędzia specjalistyczne'],
      required: true
    },
    {
      name: 'minRentalPeriod',
      label: 'Minimalny okres wynajmu',
      type: 'select',
      options: ['1 godzina', '1 dzień', '1 tydzień', '1 miesiąc'],
      required: true
    },
    {
      name: 'availability',
      label: 'Dostępność',
      type: 'select',
      options: ['dostępny', 'na żądanie', 'niedostępny'],
      required: true
    }
  ];

  const handleAddCost = () => {
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const handleEditCost = (cost: RentalCost) => {
    setEditingCost(cost);
    setIsModalOpen(true);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten sprzęt z listy?')) {
      setCosts(costs.filter(cost => cost.id !== id));
    }
  };

  const handleSubmit = (data: any) => {
    if (editingCost) {
      setCosts(costs.map(cost =>
        cost.id === editingCost.id
          ? { ...cost, ...data, unitPrice: parseFloat(data.unitPrice) }
          : cost
      ));
    } else {
      const newCost: RentalCost = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        unitPrice: parseFloat(data.unitPrice)
      };
      setCosts([...costs, newCost]);
    }
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const filteredCosts = costs.filter(cost =>
    cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCosts = groupByCategory(filteredCosts);

  const handleSort = (key: 'name' | 'price') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Koszty wynajmu sprzętu</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddCost} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj sprzęt</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po nazwie lub kategorii..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={() => handleSort('name')} className="btn-secondary">
            <span>Sortuj po nazwie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('price')} className="btn-secondary">
            <span>Sortuj po cenie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {Object.entries(groupedCosts).map(([category, costs]) => {
        const stats = calculateCategoryStats(costs);
        const sortedCosts = [...costs].sort((a, b) => {
          if (sortBy === 'name') {
            return sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else {
            return sortOrder === 'asc'
              ? a.unitPrice - b.unitPrice
              : b.unitPrice - a.unitPrice;
          }
        });

        return (
          <div key={category} className="table-container">
            <div className="stats-container">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#1E3A8A]">{category}</h3>
                <div className="text-sm text-gray-500 space-x-4">
                  <span>Liczba pozycji: {stats.count}</span>
                  <span>Średnia cena: {stats.average.toFixed(2)} PLN</span>
                  <span className="font-medium">Suma: {stats.total.toFixed(2)} PLN</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#ECF0F1]">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Nazwa sprzętu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Jednostka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Cena (PLN)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Min. okres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Dostępność
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#ECF0F1]">
                  {sortedCosts.map((cost) => (
                    <tr key={cost.id} className="table-row-hover">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cost.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cost.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1E3A8A]">
                        {cost.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cost.minRentalPeriod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cost.availability === 'dostępny'
                            ? 'bg-[#27AE60] text-white'
                            : cost.availability === 'na żądanie'
                            ? 'bg-[#F1C40F] text-gray-900'
                            : 'bg-[#E74C3C] text-white'
                        }`}>
                          {cost.availability}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-1 rounded edit-action"
                            onClick={() => handleEditCost(cost)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 rounded delete-action"
                            onClick={() => handleDeleteCost(cost.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <CostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCost(null);
        }}
        onSubmit={handleSubmit}
        title={editingCost ? 'Edytuj sprzęt' : 'Dodaj nowy sprzęt'}
        initialData={editingCost}
        fields={modalFields}
      />
    </div>
  );
}

const groupByCategory = (costs: RentalCost[]) => {
  return costs.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = [];
    }
    acc[cost.category].push(cost);
    return acc;
  }, {} as Record<string, RentalCost[]>);
};

const calculateCategoryStats = (costs: RentalCost[]) => {
  const total = costs.reduce((sum, cost) => sum + cost.unitPrice, 0);
  return {
    total,
    average: total / costs.length,
    count: costs.length
  };
};