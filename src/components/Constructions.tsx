import React, { useState } from 'react';
import { Building2, Edit2, Trash2, ArrowUpDown, Search, Plus, Download } from 'lucide-react';
import type { Construction } from '../types';
import { constructionSchema } from '../types';
import CostModal from './CostModal';

// Funkcja pomocnicza do obliczania wymiarów
const calculateDimensions = (width: number, height: number, quantity: number) => {
  const area = (width * height) / 1000000; // konwersja z mm² na m²
  const perimeter = 2 * (width + height) / 1000; // konwersja z mm na m
  return {
    area,
    totalArea: area * quantity,
    perimeter,
    totalPerimeter: perimeter * quantity
  };
};

// Przykładowe stawki montażowe
const installationRates = {
  'Okno': 120, // PLN/m²
  'Drzwi': 200 // PLN/szt
};

// Funkcja pomocnicza do obliczania kosztów materiałów
const calculateMaterialCosts = (construction: Partial<Construction>) => {
  const materialCosts = {
    items: [
      // Śruby montażowe
      {
        name: 'Śruby montażowe',
        quantity: Math.ceil(construction.perimeter! * 0.5), // 1 śruba na 0.5m
        unitPrice: 0.50,
        total: 0
      },
      // Kotwy
      {
        name: 'Kotwy',
        quantity: Math.ceil(construction.perimeter! * 0.3), // 1 kotwa na 0.3m
        unitPrice: 1.50,
        total: 0
      },
      // Pianka montażowa
      {
        name: 'Pianka montażowa',
        quantity: Math.ceil(construction.perimeter! * 0.25), // 1 opakowanie na 4m
        unitPrice: 40.00,
        total: 0
      }
    ],
    total: 0
  };

  // Obliczanie sum częściowych i całkowitej
  materialCosts.items = materialCosts.items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice
  }));
  materialCosts.total = materialCosts.items.reduce((sum, item) => sum + item.total, 0);

  return materialCosts;
};

// Funkcja pomocnicza do obliczania kosztów montażu
const calculateInstallationCosts = (construction: Partial<Construction>) => {
  const rate = installationRates[construction.type as keyof typeof installationRates] || 120;
  const total = construction.type === 'Drzwi' 
    ? rate * construction.quantity!
    : rate * construction.totalArea!;

  return {
    rate,
    total
  };
};

const initialConstructions: Construction[] = [
  {
    id: '1',
    number: 1,
    name: 'Okno PVC',
    type: 'Okno',
    width: 1500,
    height: 1500,
    quantity: 1,
    area: 2.25,
    totalArea: 2.25,
    perimeter: 6,
    totalPerimeter: 6,
    installationLocation: 'wew',
    weight: 80,
    materialCosts: calculateMaterialCosts({
      perimeter: 6,
      totalArea: 2.25,
      type: 'Okno',
      quantity: 1
    }),
    installationCosts: calculateInstallationCosts({
      type: 'Okno',
      totalArea: 2.25,
      quantity: 1
    }),
    totalCost: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const modalFields = [
  { name: 'name', label: 'Nazwa', type: 'text', required: true },
  { 
    name: 'type', 
    label: 'Typ', 
    type: 'select', 
    options: ['Okno', 'Drzwi'], 
    required: true 
  },
  { name: 'width', label: 'Szerokość (mm)', type: 'number', required: true },
  { name: 'height', label: 'Wysokość (mm)', type: 'number', required: true },
  { name: 'quantity', label: 'Ilość', type: 'number', required: true },
  { 
    name: 'installationLocation', 
    label: 'Lokalizacja montażu', 
    type: 'select',
    options: ['wew', 'zew'],
    required: true 
  },
  { name: 'weight', label: 'Waga (kg)', type: 'number', required: true }
];

export default function Constructions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConstruction, setEditingConstruction] = useState<Construction | null>(null);
  const [constructions, setConstructions] = useState<Construction[]>(() => {
    return initialConstructions.map(construction => ({
      ...construction,
      totalCost: construction.materialCosts.total + construction.installationCosts.total
    }));
  });

  const handleAddConstruction = () => {
    setEditingConstruction(null);
    setIsModalOpen(true);
  };

  const handleEditConstruction = (construction: Construction) => {
    setEditingConstruction(construction);
    setIsModalOpen(true);
  };

  const handleDeleteConstruction = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę konstrukcję?')) {
      setConstructions(constructions.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (data: any) => {
    try {
      const validatedData = constructionSchema.parse({
        name: data.name,
        type: data.type,
        width: data.width,
        height: data.height,
        quantity: data.quantity,
        installationLocation: data.installationLocation,
        weight: data.weight
      });

      const dimensions = calculateDimensions(
        validatedData.width,
        validatedData.height,
        validatedData.quantity
      );

      const materialCosts = calculateMaterialCosts({
        ...dimensions,
        type: validatedData.type,
        quantity: validatedData.quantity
      });

      const installationCosts = calculateInstallationCosts({
        type: validatedData.type,
        totalArea: dimensions.totalArea,
        quantity: validatedData.quantity
      });

      const totalCost = materialCosts.total + installationCosts.total;

      if (editingConstruction) {
        setConstructions(constructions.map(construction =>
          construction.id === editingConstruction.id
            ? {
                ...construction,
                ...validatedData,
                ...dimensions,
                materialCosts,
                installationCosts,
                totalCost,
                updatedAt: new Date().toISOString()
              }
            : construction
        ));
      } else {
        const newConstruction: Construction = {
          id: Math.random().toString(36).substr(2, 9),
          number: constructions.length + 1,
          ...validatedData,
          ...dimensions,
          materialCosts,
          installationCosts,
          totalCost,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setConstructions([...constructions, newConstruction]);
      }
      setIsModalOpen(false);
      setEditingConstruction(null);
    } catch (error) {
      console.error('Błąd walidacji:', error);
      alert('Sprawdź poprawność wprowadzonych danych');
    }
  };

  const filteredConstructions = constructions.filter(construction =>
    construction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    construction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedConstructions = [...filteredConstructions].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Konstrukcje</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddConstruction} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj konstrukcję</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po nazwie lub typie..."
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
          <button onClick={() => handleSort('date')} className="btn-secondary">
            <span>Sortuj po dacie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-[#ECF0F1]">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nr
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nazwa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Typ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Wymiary (mm)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Ilość
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Powierzchnia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Obwód
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Montaż
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Koszt materiałów
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Koszt montażu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Koszt całkowity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#ECF0F1]">
            {sortedConstructions.map((construction) => (
              <tr key={construction.id} className="table-row-hover">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {construction.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.width} x {construction.height}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.totalArea.toFixed(2)} m²
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.totalPerimeter.toFixed(2)} m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.installationLocation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.materialCosts.total.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {construction.installationCosts.total.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1E3A8A]">
                  {construction.totalCost.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1 rounded edit-action"
                      onClick={() => handleEditConstruction(construction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded delete-action"
                      onClick={() => handleDeleteConstruction(construction.id)}
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
          setEditingConstruction(null);
        }}
        onSubmit={handleSubmit}
        title={editingConstruction ? 'Edytuj konstrukcję' : 'Dodaj nową konstrukcję'}
        initialData={editingConstruction}
        fields={modalFields}
      />
    </div>
  );
}