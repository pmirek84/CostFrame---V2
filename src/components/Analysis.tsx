import React from 'react';
import { BarChart, Download } from 'lucide-react';

export default function Analysis() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Analiza</h2>
          </div>
          <button className="btn-secondary">
            <Download className="h-4 w-4" />
            <span>Eksportuj raport</span>
          </button>
        </div>

        <div className="text-center py-8 text-gray-500">
          <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak danych do analizy
          </h3>
          <p className="mb-4">
            Dodaj oferty i zlecenia, aby zobaczyć analizę danych
          </p>
        </div>
      </div>
    </div>
  );
}