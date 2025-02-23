import React, { useState, useEffect } from 'react';
import { FileText, Save, Edit2, X } from 'lucide-react';
import OfferTemplate from './OfferTemplate';
import OfferNotes from './OfferNotes';

interface OfferEditorProps {
  template: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  offerNumber?: string;
  installationAddress?: string;
}

export default function OfferEditor({ 
  template, 
  onSave, 
  onCancel,
  offerNumber,
  installationAddress 
}: OfferEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [offerData, setOfferData] = useState({
    offerNumber: offerNumber || generateOfferNumber(),
    date: new Date().toLocaleDateString('pl-PL'),
    client: {
      name: '[Nazwa klienta]',
      address: '[Adres klienta]',
      postalCode: '[Kod pocztowy]',
      city: '[Miasto]'
    },
    subject: template.title,
    scope: template.scope.map(item => 
      item.includes('[Miejsce montażu]') 
        ? item.replace('[Miejsce montażu]', installationAddress || '[Miejsce montażu]')
        : item
    ),
    materials: template.materials,
    priceNet: 0,
    priceGross: 0,
    preparedBy: {
      name: 'Jakub Keller',
      email: 'keller@stok-handel.eu',
      phone: '+48 573 105 550'
    }
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState('');

  // Aktualizuj adres montażu gdy się zmieni
  useEffect(() => {
    if (installationAddress) {
      setOfferData(prev => ({
        ...prev,
        scope: prev.scope.map(item =>
          item.includes('[Miejsce montażu]')
            ? item.replace('[Miejsce montażu]', installationAddress)
            : item
        )
      }));
    }
  }, [installationAddress]);

  // Aktualizuj numer oferty gdy się zmieni
  useEffect(() => {
    if (offerNumber) {
      setOfferData(prev => ({
        ...prev,
        offerNumber
      }));
    }
  }, [offerNumber]);

  const handleEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditedValue(Array.isArray(value) ? value.join('\n') : value);
  };

  const handleSaveField = () => {
    if (editingField) {
      const value = editingField.includes('scope') || editingField.includes('materials') 
        ? editedValue.split('\n').filter(line => line.trim())
        : editedValue;

      setOfferData(prev => {
        const newData = { ...prev };
        const fields = editingField.split('.');
        let current: any = newData;
        
        for (let i = 0; i < fields.length - 1; i++) {
          current = current[fields[i]];
        }
        current[fields[fields.length - 1]] = value;
        
        return newData;
      });
    }
    setEditingField(null);
    setEditedValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditedValue('');
  };

  const handleSave = () => {
    onSave(offerData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Edycja oferty</h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`btn-secondary ${isEditing ? 'bg-blue-100' : ''}`}
            >
              <Edit2 className="h-4 w-4" />
              <span>{isEditing ? 'Zakończ edycję' : 'Edytuj'}</span>
            </button>
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              <Save className="h-4 w-4" />
              <span>Zapisz ofertę</span>
            </button>
          </div>
        </div>

        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edytuj {editingField}</h3>
                <button onClick={handleCancelEdit}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              {editingField.includes('scope') || editingField.includes('materials') ? (
                <textarea
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="w-full h-64 p-2 border rounded"
                  placeholder="Każda linia to nowy punkt"
                />
              ) : (
                <input
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveField}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}

        <OfferTemplate
          data={offerData}
          onEdit={isEditing ? handleEdit : undefined}
        />
      </div>

      {/* Baza uwag */}
      {isEditing && (
        <OfferNotes
          onSelectNote={(note) => {
            setOfferData(prev => ({
              ...prev,
              scope: [...prev.scope, note]
            }));
          }}
        />
      )}
    </div>
  );
}

// Funkcja pomocnicza do generowania numeru oferty
function generateOfferNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OF/${year}${month}${day}-${random}`;
}