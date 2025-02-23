import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, Users } from 'lucide-react';
import type { EmployeeCost } from '../types';
import CostModal from './CostModal';

const initialEmployeeCosts: EmployeeCost[] = [
  {
    id: '1',
    position: 'Montażysta',
    hourlyRate: 50,
    monthlyRate: 8000,
    additionalCostsPercentage: 40,
    totalMonthlyCost: 8000 * 1.4
  }
];

export default function EmployeeCosts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'monthlyRate'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<EmployeeCost | null>(null);
  const [costs, setCosts] = useState<EmployeeCost[]>(initialEmployeeCosts);

  const modalFields = [
    { name: 'position', label: 'Stanowisko', type: 'text', required: true },
    { name: 'hourlyRate', label: 'Stawka godzinowa (PLN)', type: 'number', required: true },
    { name: 'monthlyRate', label: 'Stawka miesięczna (PLN)', type: 'number', required: true },
    { name: 'additionalCostsPercentage', label: 'Dodatkowe koszty (%)', type: 'number', required: true }
  ];

  const handleAddCost = () => {
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const handleEditCost = (cost: EmployeeCost) => {
    setEditingCost(cost);
    setIsModalOpen(true);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten koszt?')) {
      setCosts(costs.filter(cost => cost.id !== id));
    }
  };

  const handleSubmit = (data: any) => {
    const monthlyRate = parseFloat(data.monthlyRate);
    const additionalCostsPercentage = parseFloat(data.additionalCostsPercentage);
    const totalMonthlyCost = monthlyRate * (1 + additionalCostsPercentage / 100);

    if (editingCost) {
      setCosts(costs.map(cost =>
        cost.id === editingCost.id
          ? {
              ...cost,
              ...data,
              hourlyRate: parseFloat(data.hourlyRate),
              monthlyRate,
              additionalCostsPercentage,
              totalMonthlyCost
            }
          : cost
      ));
    } else {
      const newCost: EmployeeCost = {
        id: Math.random().toString(36).substr(2, 9),
        position: data.position,
        hourlyRate: parseFloat(data.hourlyRate),
        monthlyRate,
        additionalCostsPercentage,
        totalMonthlyCost
      };
      setCosts([...costs, newCost]);
    }
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const filteredCosts = costs.filter(cost =>
    cost.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: 'position' | 'monthlyRate') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const totalMonthlyCosts = filteredCosts.reduce((sum, cost) => sum + cost.totalMonthlyCost, 0);
  const averageHourlyRate = filteredCosts.reduce((sum, cost) => sum + cost.hourlyRate, 0) / filteredCosts.length;

  const sortedCosts = [...filteredCosts].sort((a, b) => {
    if (sortBy === 'position') {
      return sortOrder === 'asc'
        ? a.position.localeCompare(b.position)
        : b.position.localeCompare(a.position);
    } else {
      return sortOrder === 'asc'
        ? a.monthlyRate - b.monthlyRate
        : b.monthlyRate - a.monthlyRate;
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Koszty pracownicze</h2>
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
              placeholder="Szukaj stanowiska..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={() => handleSort('position')} className="btn-secondary">
            <span>Sortuj po stanowisku</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('monthlyRate')} className="btn-secondary">
            <span>Sortuj po stawce</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-[#ECF0F1] p-4 rounded-lg">
            <div className="text-sm text-gray-500">Średnia stawka godzinowa:</div>
            <div className="text-lg font-semibold text-[#1E3A8A]">{averageHourlyRate.toFixed(2)} PLN</div>
          </div>
          <div className="bg-[#ECF0F1] p-4 rounded-lg">
            <div className="text-sm text-gray-500">Suma kosztów miesięcznych:</div>
            <div className="text-lg font-semibold text-[#1E3A8A]">{totalMonthlyCosts.toFixed(2)} PLN</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-[#ECF0F1]">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Stanowisko
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Stawka godzinowa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Stawka miesięczna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Dodatkowe koszty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Całkowity koszt miesięczny
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
                  {cost.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.hourlyRate.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.monthlyRate.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.additionalCostsPercentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1E3A8A]">
                  {cost.totalMonthlyCost.toFixed(2)} PLN
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