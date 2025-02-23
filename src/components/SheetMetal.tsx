import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown, Search, Plus, Download, Scissors } from 'lucide-react';
import CostModal from './CostModal';

interface SheetMetalItem {
  id: string;
  name: string;
  type: string;
  material: string;
  finishing: string;
  thickness: number;
  width: number;
  length: number;
  color: string;
  unitPrice: number;
  unit: string;
  category: string;
}

const initialSheetMetalItems: SheetMetalItem[] = [
  {
    id: '1',
    name: 'Parapet zewnętrzny stalowy',
    type: 'Parapet',
    material: 'Stal ocynkowana',
    finishing: 'Lakier PVD',
    thickness: 0.7,
    width: 200,
    length: 1000,
    color: 'RAL 9016',
    unitPrice: 35.00,
    unit: 'mb',
    category: 'Parapety'
  },
  {
    id: '2',
    name: 'Parapet zewnętrzny aluminiowy',
    type: 'Parapet',
    material: 'Aluminium',
    finishing: 'Lakier proszkowy',
    thickness: 1.0,
    width: 200,
    length: 1000,
    color: 'RAL 9016',
    unitPrice: 50.00,
    unit: 'mb',
    category: 'Parapety'
  },
  {
    id: '3',
    name: 'Listwa maskująca',
    type: 'Listwa',
    material: 'Aluminium',
    finishing: 'Lakier proszkowy',
    thickness: 1.2,
    width: 30,
    length: 2000,
    color: 'RAL 9016',
    unitPrice: 45.00,
    unit: 'mb',
    category: 'Listwy'
  },
  {
    id: '4',
    name: 'Nadproże blaszane',
    type: 'Obróbka',
    material: 'Blacha stalowa',
    finishing: 'Surowy',
    thickness: 1.0,
    width: 200,
    length: 2000,
    color: 'Surowy',
    unitPrice: 55.00,
    unit: 'mb',
    category: 'Obróbki'
  },
  {
    id: '5',
    name: 'Profil okapowy',
    type: 'Profil',
    material: 'Aluminium',
    finishing: 'Lakier proszkowy',
    thickness: 0.8,
    width: 20,
    length: 2000,
    color: 'RAL 9016',
    unitPrice: 60.00,
    unit: 'mb',
    category: 'Profile'
  },
  {
    id: '6',
    name: 'Blacha zabezpieczająca',
    type: 'Obróbka',
    material: 'Blacha ocynkowana',
    finishing: 'Surowy',
    thickness: 1.5,
    width: 1000,
    length: 2000,
    color: 'Surowy',
    unitPrice: 90.00,
    unit: 'm²',
    category: 'Obróbki'
  },
  {
    id: '7',
    name: 'Kątownik montażowy',
    type: 'Kątownik',
    material: 'Stal nierdzewna',
    finishing: 'Surowy',
    thickness: 2.0,
    width: 40,
    length: 2000,
    color: 'Surowy',
    unitPrice: 70.00,
    unit: 'mb',
    category: 'Profile'
  }
];

export default function SheetMetal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SheetMetalItem | null>(null);
  const [items, setItems] = useState<SheetMetalItem[]>(initialSheetMetalItems);

  const modalFields = [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    { 
      name: 'type', 
      label: 'Typ', 
      type: 'select', 
      options: ['Parapet', 'Listwa', 'Obróbka', 'Profil', 'Kątownik'],
      required: true 
    },
    { 
      name: 'material', 
      label: 'Materiał', 
      type: 'select', 
      options: ['Stal ocynkowana', 'Aluminium', 'Blacha stalowa', 'Stal nierdzewna'],
      required: true 
    },
    {
      name: 'finishing',
      label: 'Wykończenie',
      type: 'select',
      options: ['Lakier PVD', 'Lakier proszkowy', 'Surowy'],
      required: true
    },
    { name: 'thickness', label: 'Grubość (mm)', type: 'number', required: true },
    { name: 'width', label: 'Szerokość (mm)', type: 'number', required: true },
    { name: 'length', label: 'Długość (mm)', type: 'number', required: true },
    { name: 'color', label: 'Kolor', type: 'text', required: true },
    { name: 'unitPrice', label: 'Cena jednostkowa (PLN)', type: 'number', required: true },
    { 
      name: 'unit', 
      label: 'Jednostka', 
      type: 'select', 
      options: ['mb', 'm²'],
      required: true 
    },
    { 
      name: 'category', 
      label: 'Kategoria', 
      type: 'select', 
      options: ['Parapety', 'Listwy', 'Obróbki', 'Profile'],
      required: true 
    }
  ];

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: SheetMetalItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę pozycję?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...data, unitPrice: parseFloat(data.unitPrice) }
          : item
      ));
    } else {
      const newItem: SheetMetalItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        unitPrice: parseFloat(data.unitPrice)
      };
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: 'name' | 'price') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
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
          <div className="flex items-center space-x-3">
            <Scissors className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Obróbki blacharskie</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddItem} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj obróbkę</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po nazwie, materiale lub typie..."
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
                Materiał
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Wykończenie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Grubość (mm)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Wymiary (mm)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Rozwinięcie (mm)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Cena (PLN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Jednostka
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#ECF0F1]">
            {sortedItems.map((item) => (
              <tr key={item.id} className="table-row-hover">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.material}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.finishing}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.thickness}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.width} x {item.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.width}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1E3A8A]">
                  {item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1 rounded edit-action"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded delete-action"
                      onClick={() => handleDeleteItem(item.id)}
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
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        title={editingItem ? 'Edytuj obróbkę' : 'Dodaj nową obróbkę'}
        initialData={editingItem}
        fields={modalFields}
      />
    </div>
  );
}