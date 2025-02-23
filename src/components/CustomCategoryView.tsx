import React, { useState } from 'react';
import { Plus, Save, X, Layout, Edit2, Trash2, MoveUp, MoveDown } from 'lucide-react';
import CostModal from './CostModal';

interface Field {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  required?: boolean;
}

interface Section {
  id: string;
  name: string;
  fields: Field[];
}

interface CustomCategoryViewProps {
  categoryId: string;
  categoryName: string;
}

export default function CustomCategoryView({ categoryId, categoryName }: CustomCategoryViewProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingField, setIsAddingField] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [costs, setCosts] = useState<Record<string, any>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Record<string, any> | null>(null);

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        name: newSectionName,
        fields: []
      };
      setSections([...sections, newSection]);
      setNewSectionName('');
      setIsAddingSection(false);
    }
  };

  const handleAddField = (sectionId: string, field: Field) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: [...section.fields, field] }
        : section
    ));
    setIsAddingField(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę sekcję?')) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const handleMoveField = (sectionId: string, fieldId: string, direction: 'up' | 'down') => {
    setSections(sections.map(section => {
      if (section.id !== sectionId) return section;

      const fields = [...section.fields];
      const index = fields.findIndex(f => f.id === fieldId);
      if (index === -1) return section;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= fields.length) return section;

      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      return { ...section, fields };
    }));
  };

  const handleAddCost = () => {
    setEditingCost(null);
    setIsModalOpen(true);
  };

  const handleSubmitCost = (data: Record<string, any>) => {
    if (editingCost) {
      setCosts(costs.map(cost =>
        cost.id === editingCost.id ? { ...cost, ...data } : cost
      ));
    } else {
      const newCost = {
        id: `cost-${Date.now()}`,
        ...data
      };
      setCosts([...costs, newCost]);
    }
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const handleDeleteCost = (costId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten koszt?')) {
      setCosts(costs.filter(cost => cost.id !== costId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Layout className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">{categoryName}</h2>
          </div>
          
          {sections.length > 0 && (
            <button onClick={handleAddCost} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Dodaj koszt</span>
            </button>
          )}
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-8">
            <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Dostosuj układ kategorii
            </h3>
            <p className="text-gray-500 mb-4">
              Dodaj sekcje i pola, aby rozpocząć zbieranie danych
            </p>
            <button
              onClick={() => setIsAddingSection(true)}
              className="btn-primary mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj pierwszą sekcję</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{section.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsAddingField(section.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                      title="Dodaj pole"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-600"
                      title="Usuń sekcję"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {section.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{field.label}</span>
                        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMoveField(section.id, field.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded-full ${
                            index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveField(section.id, field.id, 'down')}
                          disabled={index === section.fields.length - 1}
                          className={`p-1 rounded-full ${
                            index === section.fields.length - 1
                              ? 'text-gray-300'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <MoveDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(section.id, field.id)}
                          className="p-1 hover:bg-red-100 rounded-full text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {isAddingField === section.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Dodaj nowe pole</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nazwa pola
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="np. Cena jednostkowa"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Typ pola
                          </label>
                          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="text">Tekst</option>
                            <option value="number">Liczba</option>
                            <option value="select">Lista wyboru</option>
                            <option value="date">Data</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setIsAddingField(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Anuluj
                          </button>
                          <button
                            onClick={() => {
                              const newField: Field = {
                                id: `field-${Date.now()}`,
                                name: 'new-field',
                                label: 'Nowe pole',
                                type: 'text'
                              };
                              handleAddField(section.id, newField);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Dodaj pole
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddingSection && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Nazwa sekcji"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSection}
                className="p-2 hover:bg-blue-100 rounded-full text-blue-600"
                title="Zapisz"
              >
                <Save className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setIsAddingSection(false);
                  setNewSectionName('');
                }}
                className="p-2 hover:bg-red-100 rounded-full text-red-600"
                title="Anuluj"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {sections.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {sections.flatMap(section =>
                    section.fields.map(field => (
                      <th
                        key={field.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {field.label}
                      </th>
                    ))
                  )}
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costs.map((cost) => (
                  <tr key={cost.id}>
                    {sections.flatMap(section =>
                      section.fields.map(field => (
                        <td
                          key={field.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cost[field.name]}
                        </td>
                      ))
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingCost(cost);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCost(cost.id)}
                          className="text-red-600 hover:text-red-900"
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
      )}

      <CostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCost(null);
        }}
        onSubmit={handleSubmitCost}
        title={editingCost ? 'Edytuj koszt' : 'Dodaj nowy koszt'}
        initialData={editingCost}
        fields={sections.flatMap(section => section.fields)}
      />
    </div>
  );
}