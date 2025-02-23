import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, Shield } from 'lucide-react';
import type { WarrantyServiceCost } from '../types';
import CostModal from './CostModal';

const initialWarrantyServiceCosts: WarrantyServiceCost[] = [
  {
    id: '1',
    name: 'Koszt dojazdu na serwis',
    unit: 'km',
    unitPrice: 2.5,
    category: 'Koszty serwisowe'
  },
  {
    id: '2',
    name: 'Koszt części zamiennych',
    unit: 'szt.',
    unitPrice: 150,
    category: 'Części zamienne'
  }
];

export default function WarrantyServiceCosts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<WarrantyServiceCost | null>(null);
  const [costs, setCosts] = useState<WarrantyServiceCost[]>(initialWarrantyServiceCosts);

  const modalFields = [
    { name: 'name', label: 'Nazwa kosztu', type: 'text', required: true },
    { name: 'unit', label: 'Jednostka', type: 'text', required: true },
    { name: 'unitPrice', label: 'Cena jednostkowa (PLN)', type: 'number', required: true },
    {
      name: 'category',
      label: 'Kategoria',
      type: 'select',
      options: ['Koszty serwisowe', 'Części zamienne', 'Materiały', 'Przeglądy gwarancyjne', 'Ubezpieczenia', 'Obsługa gwarancyjna'],
      required: true
    }
  ];

  const handleAddCost = () => {
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const handleEditCost = (cost: WarrantyServiceCost) => {
    setEditingCost(cost);
    setIsModalOpen(true);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten koszt?')) {
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
      const newCost: WarrantyServiceCost = {
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
            <Shield className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Koszty gwarancji i serwisu</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddCost} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj koszt</span>
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
                      Nazwa kosztu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Jednostka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Cena jednostkowa (PLN)
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
        title={editingCost ? 'Edytuj koszt' : 'Dodaj nowy koszt'}
        initialData={editingCost}
        fields={modalFields}
      />
    </div>
  );
}

const groupByCategory = (costs: WarrantyServiceCost[]) => {
  return costs.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = [];
    }
    acc[cost.category].push(cost);
    return acc;
  }, {} as Record<string, WarrantyServiceCost[]>);
};

const calculateCategoryStats = (costs: WarrantyServiceCost[]) => {
  const total = costs.reduce((sum, cost) => sum + cost.unitPrice, 0);
  return {
    total,
    average: total / costs.length,
    count: costs.length
  };
};