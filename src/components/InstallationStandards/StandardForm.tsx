import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import type { InstallationStandard } from '../../hooks/useInstallationStandards';

interface StandardFormProps {
  standard?: InstallationStandard | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function StandardForm({ standard, onSubmit, onCancel }: StandardFormProps) {
  const [materials, setMaterials] = useState(standard?.materials || []);
  const [methods, setMethods] = useState(standard?.methods || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      materials,
      labor: {
        hoursPerUnit: parseFloat(formData.get('hoursPerUnit') as string),
        hourlyRate: parseFloat(formData.get('hourlyRate') as string)
      },
      methods
    };

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1E3A8A]">
            {standard ? 'Edytuj standard' : 'Nowy standard montażu'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Podstawowe informacje */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nazwa standardu
              </label>
              <input
                type="text"
                name="name"
                defaultValue={standard?.name}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Opis
              </label>
              <textarea
                name="description"
                defaultValue={standard?.description}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Materiały */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Materiały</h3>
              <button
                type="button"
                onClick={() => {
                  setMaterials([
                    ...materials,
                    {
                      id: crypto.randomUUID(),
                      name: '',
                      quantityPerMeter: 0,
                      unit: 'szt',
                      unitPrice: 0
                    }
                  ]);
                }}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj materiał</span>
              </button>
            </div>

            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={material.id} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => {
                      const newMaterials = [...materials];
                      newMaterials[index].name = e.target.value;
                      setMaterials(newMaterials);
                    }}
                    placeholder="Nazwa materiału"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={material.quantityPerMeter}
                    onChange={(e) => {
                      const newMaterials = [...materials];
                      newMaterials[index].quantityPerMeter = parseFloat(e.target.value);
                      setMaterials(newMaterials);
                    }}
                    placeholder="Ilość/m"
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <select
                    value={material.unit}
                    onChange={(e) => {
                      const newMaterials = [...materials];
                      newMaterials[index].unit = e.target.value;
                      setMaterials(newMaterials);
                    }}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="szt">szt</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                  </select>
                  <input
                    type="number"
                    value={material.unitPrice}
                    onChange={(e) => {
                      const newMaterials = [...materials];
                      newMaterials[index].unitPrice = parseFloat(e.target.value);
                      setMaterials(newMaterials);
                    }}
                    placeholder="Cena jedn."
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMaterials(materials.filter((_, i) => i !== index));
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Robocizna */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Robocizna</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Czas na jednostkę (h)
                </label>
                <input
                  type="number"
                  name="hoursPerUnit"
                  defaultValue={standard?.labor.hoursPerUnit}
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stawka godzinowa (PLN)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  defaultValue={standard?.labor.hourlyRate}
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Metody montażu */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Metody montażu</h3>
              <button
                type="button"
                onClick={() => {
                  setMethods([
                    ...methods,
                    {
                      id: crypto.randomUUID(),
                      name: '',
                      description: ''
                    }
                  ]);
                }}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj metodę</span>
              </button>
            </div>

            <div className="space-y-4">
              {methods.map((method, index) => (
                <div key={method.id} className="flex items-start space-x-4">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const newMethods = [...methods];
                        newMethods[index].name = e.target.value;
                        setMethods(newMethods);
                      }}
                      placeholder="Nazwa metody"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <textarea
                      value={method.description}
                      onChange={(e) => {
                        const newMethods = [...methods];
                        newMethods[index].description = e.target.value;
                        setMethods(newMethods);
                      }}
                      placeholder="Opis metody"
                      rows={2}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMethods(methods.filter((_, i) => i !== index));
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
              <Save className="h-4 w-4 mr-2" />
              Zapisz standard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}