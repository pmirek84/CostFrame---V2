import React, { useState } from 'react';
import { Copy, Plus, X, Save } from 'lucide-react';

interface TemplateFormProps {
  template?: {
    id: string;
    name: string;
    title: string;
    scope: string[];
    location: {
      required: boolean;
      label: string;
    };
    additionalInfo: {
      clientObligations: string;
      schedule: string;
      materials: {
        byUs: string[];
        byClient: string[];
      };
      notes: string[];
    };
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    title: template?.title || '',
    scope: template?.scope || [''],
    location: {
      required: template?.location.required || true,
      label: template?.location.label || 'Miejsce montażu'
    },
    additionalInfo: {
      clientObligations: template?.additionalInfo.clientObligations || '',
      schedule: template?.additionalInfo.schedule || '',
      materials: {
        byUs: template?.additionalInfo.materials.byUs || [''],
        byClient: template?.additionalInfo.materials.byClient || ['']
      },
      notes: template?.additionalInfo.notes || []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleScopeChange = (index: number, value: string) => {
    const newScope = [...formData.scope];
    newScope[index] = value;
    setFormData({ ...formData, scope: newScope });
  };

  const handleMaterialChange = (type: 'byUs' | 'byClient', index: number, value: string) => {
    const newMaterials = { ...formData.additionalInfo.materials };
    newMaterials[type][index] = value;
    setFormData({
      ...formData,
      additionalInfo: {
        ...formData.additionalInfo,
        materials: newMaterials
      }
    });
  };

  const addScopeItem = () => {
    setFormData({ ...formData, scope: [...formData.scope, ''] });
  };

  const removeScopeItem = (index: number) => {
    const newScope = formData.scope.filter((_, i) => i !== index);
    setFormData({ ...formData, scope: newScope });
  };

  const addMaterialItem = (type: 'byUs' | 'byClient') => {
    const newMaterials = { ...formData.additionalInfo.materials };
    newMaterials[type] = [...newMaterials[type], ''];
    setFormData({
      ...formData,
      additionalInfo: {
        ...formData.additionalInfo,
        materials: newMaterials
      }
    });
  };

  const removeMaterialItem = (type: 'byUs' | 'byClient', index: number) => {
    const newMaterials = { ...formData.additionalInfo.materials };
    newMaterials[type] = newMaterials[type].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      additionalInfo: {
        ...formData.additionalInfo,
        materials: newMaterials
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Copy className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">
              {template ? 'Edytuj wzór oferty' : 'Nowy wzór oferty'}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Podstawowe informacje</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nazwa wzoru
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tytuł oferty
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Zakres prac */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Zakres prac</h3>
              <button
                type="button"
                onClick={addScopeItem}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj punkt</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.scope.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleScopeChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={`Punkt ${index + 1}`}
                    required
                  />
                  {formData.scope.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScopeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Materiały */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Materiały</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Materiały dostarczane przez nas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Dostarczane przez nas</h4>
                  <button
                    type="button"
                    onClick={() => addMaterialItem('byUs')}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Plus className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.additionalInfo.materials.byUs.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMaterialChange('byUs', index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Nazwa materiału"
                        required
                      />
                      {formData.additionalInfo.materials.byUs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterialItem('byUs', index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Materiały dostarczane przez klienta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Dostarczane przez klienta</h4>
                  <button
                    type="button"
                    onClick={() => addMaterialItem('byClient')}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Plus className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.additionalInfo.materials.byClient.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMaterialChange('byClient', index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Nazwa materiału"
                        required
                      />
                      {formData.additionalInfo.materials.byClient.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterialItem('byClient', index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              {template ? 'Zapisz zmiany' : 'Zapisz wzór'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}