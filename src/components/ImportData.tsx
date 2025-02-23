import React from 'react';
import ImportSection from './ImportSection';

const importSections = [
  {
    id: 'materials',
    title: 'Koszty materiałów montażowych',
    fields: ['name', 'category', 'subCategory', 'unit', 'unitPrice', 'usage', 'application']
  },
  {
    id: 'employees',
    title: 'Koszty pracownicze',
    fields: ['position', 'hourlyRate', 'monthlyRate', 'additionalCostsPercentage']
  },
  {
    id: 'logistics',
    title: 'Koszty logistyki',
    fields: ['name', 'unit', 'unitPrice', 'category']
  },
  {
    id: 'warranty',
    title: 'Koszty gwarancji i serwisu',
    fields: ['name', 'unit', 'unitPrice', 'category']
  },
  {
    id: 'rental',
    title: 'Koszty wynajmu sprzętu',
    fields: ['name', 'unit', 'unitPrice', 'category', 'minRentalPeriod', 'availability']
  },
  {
    id: 'internal',
    title: 'Koszty własne',
    fields: ['name', 'unit', 'unitPrice', 'category', 'period']
  }
];

export default function ImportData() {
  const handleImport = (sectionId: string, data: any) => {
    // Tu dodać logikę importu danych dla konkretnej sekcji
    console.log(`Importowanie danych dla sekcji ${sectionId}:`, data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E3A8A] mb-4">Import danych</h2>
        <p className="text-gray-600 mb-2">
          Wybierz kategorię kosztów i zaimportuj dane z pliku Excel lub CSV.
        </p>
        <div className="text-sm text-gray-500">
          <p>Wskazówki:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Pobierz szablon dla wybranej kategorii</li>
            <li>Wypełnij szablon danymi</li>
            <li>Zaimportuj wypełniony plik</li>
            <li>Sprawdź zaimportowane dane w odpowiedniej zakładce</li>
          </ul>
        </div>
      </div>

      {importSections.map((section) => (
        <ImportSection
          key={section.id}
          title={section.title}
          onImport={(data) => handleImport(section.id, data)}
          templateFields={section.fields}
        />
      ))}
    </div>
  );
}