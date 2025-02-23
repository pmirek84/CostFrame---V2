import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Layout, MoveUp, MoveDown } from 'lucide-react';
import { useInstallationStandards, type InstallationStandard } from '../../hooks/useInstallationStandards';
import StandardForm from './StandardForm';
import StandardDetails from './StandardDetails';

export default function StandardsManager() {
  const { standards, loading, error, refresh } = useInstallationStandards();
  const [isAddingStandard, setIsAddingStandard] = useState(false);
  const [editingStandard, setEditingStandard] = useState<InstallationStandard | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<InstallationStandard | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p className="text-lg font-medium">Błąd podczas ładowania standardów montażu</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Layout className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Standardy Montażu</h2>
          </div>
          <button 
            onClick={() => setIsAddingStandard(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj standard</span>
          </button>
        </div>

        <div className="grid gap-6">
          {standards.map((standard) => (
            <div
              key={standard.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#1E3A8A] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{standard.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedStandard(standard)}
                    className="p-1 rounded hover:bg-blue-100 text-blue-600"
                    title="Szczegóły"
                  >
                    <Layout className="h-4 w-4" />
                  </button>
                  {!standard.isPredefined && (
                    <>
                      <button
                        onClick={() => setEditingStandard(standard)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz usunąć ten standard?')) {
                            // Handle delete
                          }
                        }}
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{standard.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Materiały</h4>
                  <ul className="space-y-1">
                    {standard.materials.map((material) => (
                      <li key={material.id} className="text-sm text-gray-600">
                        {material.name} - {material.quantityPerMeter} {material.unit}/m
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Robocizna</h4>
                  <p className="text-sm text-gray-600">
                    {standard.labor.hoursPerUnit} godz/jedn. po {standard.labor.hourlyRate} PLN/h
                  </p>
                </div>
              </div>

              {standard.methods.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Metody montażu</h4>
                  <ul className="space-y-1">
                    {standard.methods.map((method) => (
                      <li key={method.id} className="text-sm text-gray-600">
                        {method.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formularz dodawania/edycji standardu */}
      {(isAddingStandard || editingStandard) && (
        <StandardForm
          standard={editingStandard}
          onSubmit={async (data) => {
            // Handle submit
            setIsAddingStandard(false);
            setEditingStandard(null);
            await refresh();
          }}
          onCancel={() => {
            setIsAddingStandard(false);
            setEditingStandard(null);
          }}
        />
      )}

      {/* Szczegóły standardu */}
      {selectedStandard && (
        <StandardDetails
          standard={selectedStandard}
          onClose={() => setSelectedStandard(null)}
        />
      )}
    </div>
  );
}