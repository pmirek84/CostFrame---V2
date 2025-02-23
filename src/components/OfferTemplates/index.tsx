import React, { useState } from 'react';
import { Copy, Plus, Download, Edit2, Trash2, FileText } from 'lucide-react';
import DefaultTemplate from './DefaultTemplate';
import TemplateForm from './TemplateForm';
import OfferNotes from './OfferNotes';
import OfferEditor from './OfferEditor';

interface OfferTemplate {
  id: string;
  name: string;
  title: string;
  scope: string[];
  additionalInfo: {
    clientObligations: string[];
    schedule: string;
    materials: {
      byUs: string[];
      byClient: string[];
    };
    notes: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function OfferTemplates() {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OfferTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: OfferTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten wzór?')) {
      setTemplates(templates.filter(template => template.id !== id));
    }
  };

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingTemplate) {
      setTemplates(templates.map(template =>
        template.id === editingTemplate.id
          ? {
              ...template,
              ...data,
              updatedAt: new Date().toISOString()
            }
          : template
      ));
    } else {
      const newTemplate: OfferTemplate = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setIsEditorOpen(false);
    setEditingTemplate(null);
    setSelectedTemplate(null);
  };

  if (isEditorOpen && selectedTemplate) {
    return (
      <OfferEditor
        template={selectedTemplate}
        onSave={(data) => {
          console.log('Saving offer:', data);
          handleCancel();
        }}
        onCancel={handleCancel}
      />
    );
  }

  if (isFormOpen) {
    return (
      <TemplateForm
        template={editingTemplate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Copy className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Wzory ofert</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddTemplate} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Nowy wzór</span>
            </button>
          </div>
        </div>

        {/* Domyślny wzór oferty */}
        <DefaultTemplate onUse={() => handleUseTemplate({
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
        })} />

        {/* Lista własnych wzorów */}
        {templates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Własne wzory</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#1E3A8A] transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">
                        Utworzono: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.title}
                  </p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Użyj tego wzoru
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notatki do ofert */}
      <OfferNotes />
    </div>
  );
}