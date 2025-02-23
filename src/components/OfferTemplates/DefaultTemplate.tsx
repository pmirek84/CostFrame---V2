import React from 'react';
import { FileText } from 'lucide-react';

interface DefaultTemplateProps {
  onUse: () => void;
}

export default function DefaultTemplate({ onUse }: DefaultTemplateProps) {
  const template = {
    name: 'Standardowy wzór oferty montażowej',
    title: 'Oferta montażu konstrukcji aluminiowych',
    scope: [
      'Montaż konstrukcji aluminiowych zgodnie z załącznikiem nr 1',
      'Usługa odbędzie się na terenie zakładu produkcyjnego klienta Zleceniodawcy pod adresem: Koszalin, ul. Lniana 16',
      'Dokładny pomiar produkcyjny i przygotowanie konstrukcji do montażu jest po stronie Zleceniodawcy.',
      'Po stronie Zleceniodawcy jest przygotowanie otworów montażowych w konstrukcjach aluminiowych zgodnie z wymaganiami systemodawcy.',
      'Zleceniodawca jest zobowiązany do poinformowania na 1 tydzień przed planowanym montażem firmę STOK o możliwości rozpoczęcia montażu w danym terminie.',
      'Montaż odbędzie się 1-etapowo i w ciągłości dlatego Zleceniodawca gwarantuje dostawę wszystkich niezbędnych konstrukcji, elementów i materiałów w ustalonym terminie.'
    ],
    materials: {
      byUs: ['śruby do mocowania oraz folia EPDM wraz z klejem'],
      byClient: ['taśma rozprężna 3-warstwowa, dopasowana do profilu i wymiarów otworów']
    },
    notes: [
      'Oferta nie obejmuje obróbek blacharskich.'
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-[#1E3A8A]" />
          <h2 className="text-xl font-semibold text-[#1E3A8A]">{template.name}</h2>
        </div>
        <button onClick={onUse} className="btn-primary">
          Użyj tego wzoru
        </button>
      </div>

      <div className="space-y-6">
        {/* Zakres prac */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Zakres prac</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {template.scope.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ol>
        </div>

        {/* Materiały */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Materiały montażowe</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">STOK SP. Z O.O.:</h4>
              <p className="text-gray-700">{template.materials.byUs.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Zleceniodawca:</h4>
              <p className="text-gray-700">{template.materials.byClient.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Uwagi */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Uwagi</h3>
          <ul className="list-disc pl-5 space-y-2">
            {template.notes.map((note, index) => (
              <li key={index} className="text-gray-700">{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}