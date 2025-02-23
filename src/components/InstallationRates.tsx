import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, Hammer } from 'lucide-react';
import CostModal from './CostModal';

interface InstallationRate {
  id: string;
  type: string;
  rate: number;
  unit: string;
}

const initialInstallationRates: InstallationRate[] = [
  { id: '1', type: 'Okno PVC', rate: 120, unit: 'm²' },
  { id: '2', type: 'Okno aluminiowe', rate: 150, unit: 'm²' },
  { id: '3', type: 'Okno drewniane', rate: 140, unit: 'm²' },
  { id: '4', type: 'Drzwi zewnętrzne', rate: 200, unit: 'szt.' },
  { id: '5', type: 'Drzwi wewnętrzne', rate: 180, unit: 'szt.' },
  { id: '6', type: 'Fasady aluminiowe', rate: 250, unit: 'm²' },
  { id: '7', type: 'Ogrody zimowe', rate: 300, unit: 'm²' },
  { id: '8', type: 'Pergole aluminiowe', rate: 180, unit: 'm²' },
  { id: '9', type: 'Parapety zewnętrzne', rate: 45, unit: 'mb' },
  { id: '10', type: 'Parapety wewnętrzne', rate: 35, unit: 'mb' },
  { id: '11', type: 'Listwy wykończeniowe', rate: 25, unit: 'mb' },
  { id: '12', type: 'Rolety zewnętrzne', rate: 100, unit: 'szt.' },
  { id: '13', type: 'Bramy garażowe', rate: 350, unit: 'szt.' },
  { id: '14', type: 'ZIP screeny', rate: 90, unit: 'm²' }
];

export default function InstallationRates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'type' | 'rate'>('type');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<InstallationRate | null>(null);
  const [rates, setRates] = useState<InstallationRate[]>(initialInstallationRates);

  const modalFields = [
    { name: 'type', label: 'Typ konstrukcji', type: 'text', required: true },
    { name: 'rate', label: 'Stawka montażowa (PLN)', type: 'number', required: true },
    { 
      name: 'unit', 
      label: 'Jednostka miary', 
      type: 'select', 
      options: ['m²', 'mb', 'szt.'], 
      required: true 
    }
  ];

  const handleAddRate = () => {
    setEditingRate(null);
    setIsModalOpen(true);
  };

  const handleEditRate = (rate: InstallationRate) => {
    setEditingRate(rate);
    setIsModalOpen(true);
  };

  const handleDeleteRate = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę stawkę?')) {
      setRates(rates.filter(rate => rate.id !== id));
    }
  };

  const handleSubmit = (data: any) => {
    if (editingRate) {
      setRates(rates.map(rate =>
        rate.id === editingRate.id
          ? { ...rate, ...data, rate: parseFloat(data.rate) }
          : rate
      ));
    } else {
      const newRate: InstallationRate = {
        id: Math.random().toString(36).substr(2, 9),
        type: data.type,
        rate: parseFloat(data.rate),
        unit: data.unit
      };
      setRates([...rates, newRate]);
    }
    setIsModalOpen(false);
    setEditingRate(null);
  };

  const filteredRates = rates.filter(rate =>
    rate.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: 'type' | 'rate') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedRates = [...filteredRates].sort((a, b) => {
    if (sortBy === 'type') {
      return sortOrder === 'asc'
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    } else {
      return sortOrder === 'asc'
        ? a.rate - b.rate
        : b.rate - a.rate;
    }
  });

  const totalRates = filteredRates.reduce((sum, rate) => sum + rate.rate, 0);
  const averageRate = totalRates / filteredRates.length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Hammer className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Stawki montażu</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddRate} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj stawkę</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po typie konstrukcji..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={() => handleSort('type')} className="btn-secondary">
            <span>Sortuj po typie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('rate')} className="btn-secondary">
            <span>Sortuj po stawce</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-[#ECF0F1] p-4 rounded-lg">
            <div className="text-sm text-gray-500">Średnia stawka:</div>
            <div className="text-lg font-semibold text-[#1E3A8A]">{averageRate.toFixed(2)} PLN</div>
          </div>
          <div className="bg-[#ECF0F1] p-4 rounded-lg">
            <div className="text-sm text-gray-500">Liczba pozycji:</div>
            <div className="text-lg font-semibold text-[#1E3A8A]">{filteredRates.length}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-[#ECF0F1]">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Typ konstrukcji
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Stawka montażowa (PLN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Jednostka miary
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#ECF0F1]">
            {sortedRates.map((rate) => (
              <tr key={rate.id} className="table-row-hover">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rate.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1E3A8A]">
                  {rate.rate.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rate.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1 rounded edit-action"
                      onClick={() => handleEditRate(rate)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded delete-action"
                      onClick={() => handleDeleteRate(rate.id)}
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
          setEditingRate(null);
        }}
        onSubmit={handleSubmit}
        title={editingRate ? 'Edytuj stawkę' : 'Dodaj nową stawkę'}
        initialData={editingRate}
        fields={modalFields}
      />
    </div>
  );
}