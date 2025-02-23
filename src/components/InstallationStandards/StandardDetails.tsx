import React from 'react';
import { X, PenTool as Tool, Users, FileText } from 'lucide-react';
import type { InstallationStandard } from '../../hooks/useInstallationStandards';

interface StandardDetailsProps {
  standard: InstallationStandard;
  onClose: () => void;
}

export default function StandardDetails({ standard, onClose }: StandardDetailsProps) {
  // Ensure we have default values for nested objects
  const materials = standard?.materials || [];
  const labor = standard?.labor || { hoursPerUnit: 0, hourlyRate: 0 };
  const methods = standard?.methods || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1E3A8A]">{standard?.name || 'Standard montażu'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Opis */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Opis</h3>
            <p className="text-gray-600">{standard?.description || 'Brak opisu'}</p>
          </div>

          {/* Materiały */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Tool className="h-5 w-5 text-[#1E3A8A]" />
              <h3 className="text-lg font-medium text-gray-900">Materiały</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {materials.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500">Nazwa</th>
                      <th className="text-left text-sm font-medium text-gray-500">Zużycie/m</th>
                      <th className="text-left text-sm font-medium text-gray-500">Jednostka</th>
                      <th className="text-left text-sm font-medium text-gray-500">Cena jedn.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td className="py-2 text-sm text-gray-900">{material.name}</td>
                        <td className="py-2 text-sm text-gray-900">{material.quantityPerMeter}</td>
                        <td className="py-2 text-sm text-gray-900">{material.unit}</td>
                        <td className="py-2 text-sm text-gray-900">{material.unitPrice?.toFixed(2) || '0.00'} PLN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Brak zdefiniowanych materiałów</p>
              )}
            </div>
          </div>

          {/* Robocizna */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-[#1E3A8A]" />
              <h3 className="text-lg font-medium text-gray-900">Robocizna</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Czas na jednostkę</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {labor.hoursPerUnit} h
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Stawka godzinowa</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {labor.hourlyRate?.toFixed(2) || '0.00'} PLN/h
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Metody montażu */}
          {methods.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-[#1E3A8A]" />
                <h3 className="text-lg font-medium text-gray-900">Metody montażu</h3>
              </div>
              <div className="space-y-4">
                {methods.map((method) => (
                  <div key={method.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}