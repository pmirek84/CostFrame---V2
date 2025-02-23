import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, RotateCcw } from 'lucide-react';
import type { CostItem } from '../types';
import CostModal from './CostModal';

const initialMountingMaterials: CostItem[] = [
  {
    id: '1',
    name: 'Śruby montażowe',
    category: 'Elementy złączne',
    subCategory: 'Śruby',
    manufacturer: 'Fischer',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '1.5-2.5 szt.',
    application: 'Mocowanie okien i drzwi do muru',
    unitPrice: 0.50
  },
  {
    id: '2',
    name: 'Kotwy',
    category: 'Elementy złączne',
    subCategory: 'Kotwy',
    manufacturer: 'Fischer',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '1-1.5 szt.',
    application: 'Kotwienie konstrukcji w murze',
    unitPrice: 1.50
  },
  {
    id: '3',
    name: 'Łączniki',
    category: 'Elementy złączne',
    subCategory: 'Łączniki',
    manufacturer: 'Rawlplug',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '0.5-1 szt.',
    application: 'Łączenie elementów konstrukcyjnych',
    unitPrice: 0.80
  },
  {
    id: '4',
    name: 'Wkręty montażowe',
    category: 'Elementy złączne',
    subCategory: 'Wkręty',
    manufacturer: 'Rockwool',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '2.5-4 szt.',
    application: 'Mocowanie do ścian i ościeżnic',
    unitPrice: 0.40
  },
  {
    id: '5',
    name: 'Konsole do montażu',
    category: 'Elementy złączne',
    subCategory: 'Konsole',
    manufacturer: 'Knelsen',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '0.5-0.75 szt.',
    application: 'Montaż w warstwie ocieplenia i podparcie dolne',
    unitPrice: 25.00
  },
  {
    id: '6',
    name: 'Wełna mineralna',
    category: 'Materiały izolacyjne',
    subCategory: 'Wełna',
    manufacturer: 'Rockwool',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm²',
    suggestedUsage: '0.25-0.5 m²',
    application: 'Izolacja cieplna - wypełnienie przestrzeni montażowych',
    unitPrice: 50.00
  },
  {
    id: '7',
    name: 'Aluthermo',
    category: 'Materiały izolacyjne',
    subCategory: 'Folie',
    manufacturer: 'Aluthermo',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm²',
    suggestedUsage: '0.125-0.25 m²',
    application: 'Izolacja refleksyjna - zapobieganie utracie ciepła',
    unitPrice: 75.00
  },
  {
    id: '8',
    name: 'Profile podokienne i drzwiowe',
    category: 'Materiały izolacyjne',
    subCategory: 'Profile',
    manufacturer: 'Europrofil',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm',
    suggestedUsage: '0.5-1 m',
    application: 'Uszczelnienie połączeń okiennych',
    unitPrice: 120.00
  },
  {
    id: '9',
    name: 'Podwaliny z klinarytu',
    category: 'Materiały izolacyjne',
    subCategory: 'Podwaliny',
    manufacturer: 'Klinaryt',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm',
    suggestedUsage: '0.5-1 m',
    application: 'Podparcie pod okna/drzwi - stabilizacja i izolacja',
    unitPrice: 100.00
  },
  {
    id: '10',
    name: 'Podwaliny z purenitu',
    category: 'Materiały izolacyjne',
    subCategory: 'Podwaliny',
    manufacturer: 'Puroterm',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm',
    suggestedUsage: '0.5-1 m',
    application: 'Podparcie pod okna/drzwi - stabilizacja i izolacja',
    unitPrice: 110.00
  },
  {
    id: '11',
    name: 'Piany montażowe',
    category: 'Materiały uszczelniające',
    subCategory: 'Piany',
    manufacturer: 'Soudal',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'opak.',
    suggestedUsage: '0.25 opak.',
    application: 'Uszczelnianie szczelin montażowych',
    unitPrice: 40.00
  },
  {
    id: '12',
    name: 'Folie okienne',
    category: 'Materiały uszczelniające',
    subCategory: 'Folie',
    manufacturer: 'Tremco',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm²',
    suggestedUsage: '0.25-0.5 m²',
    application: 'Uszczelnienie połączeń okiennych',
    unitPrice: 10.00
  },
  {
    id: '13',
    name: 'Fartuchy EPDM',
    category: 'Materiały uszczelniające',
    subCategory: 'Fartuchy',
    manufacturer: 'Tremco',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm',
    suggestedUsage: '0.5-0.75 m',
    application: 'Hydroizolacja złącza okiennego',
    unitPrice: 15.00
  },
  {
    id: '14',
    name: 'Taśmy rozprężne',
    category: 'Materiały uszczelniające',
    subCategory: 'Taśmy',
    manufacturer: 'Tremco',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'm',
    suggestedUsage: '0.5-0.75 m',
    application: 'Uszczelnianie szczelin między ramą a murem',
    unitPrice: 20.00
  },
  {
    id: '15',
    name: 'Kleje',
    category: 'Materiały uszczelniające',
    subCategory: 'Kleje',
    manufacturer: 'Tremco',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'kg',
    suggestedUsage: '0.125-0.25 kg',
    application: 'Klejenie i uszczelnianie',
    unitPrice: 30.00
  },
  {
    id: '16',
    name: 'Środki czyszczące (alkohol izopropylowy)',
    category: 'Materiały dodatkowe',
    subCategory: 'Środki czyszczące',
    manufacturer: 'SIKA',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'litr',
    suggestedUsage: '0.025-0.05 l',
    application: 'Czyszczenie powierzchni przed montażem',
    unitPrice: 15.00
  },
  {
    id: '17',
    name: 'Środki gruntujące',
    category: 'Materiały dodatkowe',
    subCategory: 'Środki gruntujące',
    manufacturer: 'Soudal',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'litr',
    suggestedUsage: '0.025 l',
    application: 'Poprawa przyczepności uszczelniaczy',
    unitPrice: 20.00
  },
  {
    id: '18',
    name: 'Podpory montażowe (kliny regulacyjne)',
    category: 'Materiały dodatkowe',
    subCategory: 'Podpory montażowe',
    manufacturer: 'Generic',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'szt.',
    suggestedUsage: '1-1.5 szt.',
    application: 'Wyrównanie i stabilizacja montażu',
    unitPrice: 5.00
  },
  {
    id: '19',
    name: 'Środki antykorozyjne',
    category: 'Materiały dodatkowe',
    subCategory: 'Środki antykorozyjne',
    manufacturer: 'Generic',
    constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna'],
    unit: 'litr',
    suggestedUsage: '0.0125 l',
    application: 'Ochrona antykorozyjna',
    unitPrice: 30.00
  }
];

export default function CostTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [costs, setCosts] = useState<CostItem[]>(initialMountingMaterials);

  const handleAddCost = () => {
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const handleEditCost = (cost: CostItem) => {
    setEditingCost(cost);
    setIsModalOpen(true);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten koszt?')) {
      setCosts(costs.filter(cost => cost.id !== id));
    }
  };

  const handleRestoreData = () => {
    if (confirm('Czy na pewno chcesz przywrócić domyślne dane? Ta operacja nadpisze obecne dane.')) {
      setCosts(initialMountingMaterials);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingCost) {
      setCosts(costs.map(cost =>
        cost.id === editingCost.id
          ? { ...cost, ...data }
          : cost
      ));
    } else {
      const newCost: CostItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        constructionTypes: ['Okno', 'Drzwi', 'HS', 'FIX', 'Witryna']
      };
      setCosts([...costs, newCost]);
    }
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const filteredCosts = costs.filter(cost =>
    cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: 'name' | 'price') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedCosts = [...filteredCosts].sort((a, b) => {
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1E3A8A]">Koszty materiałów montażowych</h2>
          <div className="flex space-x-4">
            <button onClick={handleRestoreData} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              <span>Przywróć dane</span>
            </button>
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddCost} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj materiał</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po nazwie, kategorii lub podkategorii..."
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

      <div className="table-container">
        <table className="min-w-full divide-y divide-[#ECF0F1]">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nazwa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Kategoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Podkategoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Producent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Jednostka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Sugerowane zużycie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Cena jedn. (PLN)
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
                  {cost.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.subCategory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.manufacturer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cost.suggestedUsage}
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

      <CostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCost(null);
        }}
        onSubmit={handleSubmit}
        title={editingCost ? 'Edytuj materiał' : 'Dodaj nowy materiał'}
        initialData={editingCost}
        fields={[
          { name: 'name', label: 'Nazwa', type: 'text', required: true },
          { 
            name: 'category', 
            label: 'Kategoria', 
            type: 'select', 
            options: ['Elementy złączne', 'Materiały izolacyjne', 'Materiały uszczelniające', 'Materiały dodatkowe'],
            required: true 
          },
          { name: 'subCategory', label: 'Podkategoria', type: 'text', required: true },
          { name: 'manufacturer', label: 'Producent', type: 'text', required: true },
          { name: 'unit', label: 'Jednostka', type: 'text', required: true },
          { name: 'suggestedUsage', label: 'Sugerowane zużycie', type: 'text', required: true },
          { name: 'application', label: 'Zastosowanie', type: 'text', required: true },
          { name: 'unitPrice', label: 'Cena jednostkowa (PLN)', type: 'number', required: true }
        ]}
      />
    </div>
  );
}