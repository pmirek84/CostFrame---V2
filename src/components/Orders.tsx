import React from 'react';
import { ClipboardList, Plus, Download } from 'lucide-react';

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ClipboardList className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Zlecenia</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Nowe zlecenie</span>
            </button>
          </div>
        </div>

        <div className="text-center py-8 text-gray-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak aktywnych zleceń
          </h3>
          <p className="mb-4">
            Dodaj swoje pierwsze zlecenie, aby rozpocząć zarządzanie realizacją
          </p>
        </div>
      </div>
    </div>
  );
}