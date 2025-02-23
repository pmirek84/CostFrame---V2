import React, { useState, useEffect } from 'react';
import { FileEdit, Plus, Download, Eye, Edit2, Trash2, FileText } from 'lucide-react';
import type { Offer } from '../../types/offer';
import type { Construction } from '../../types';
import type { StoredOffer } from '../../storage/offerStorage';
import { useOfferStorage } from '../../hooks/useOfferStorage';
import { useConstructionStorage } from '../../hooks/useConstructionStorage';
import OfferForm from './OfferForm';
import InitialOfferForm from './InitialOfferForm';
import OfferDetailsEditor from './OfferDetailsEditor';

export default function Offers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInitialFormOpen, setIsInitialFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<StoredOffer | null>(null);
  const [editingDetails, setEditingDetails] = useState<StoredOffer | null>(null);
  const [currentOfferData, setCurrentOfferData] = useState<{
    number: string;
    client: string;
    location: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { offers, saveOffer, deleteOffer, loadOffers } = useOfferStorage();
  const { clearConstructions, initializeConstructions } = useConstructionStorage();

  useEffect(() => {
    const init = async () => {
      try {
        await loadOffers();
      } catch (error) {
        console.error('Błąd podczas ładowania ofert:', error);
        setError('Nie udało się załadować ofert. Spróbuj odświeżyć stronę.');
      }
    };
    init();
  }, [loadOffers]);

  const handleAddOffer = async () => {
    try {
      setError(null);
      await clearConstructions();
      setEditingOffer(null);
      setCurrentOfferData(null);
      setIsInitialFormOpen(true);
    } catch (error) {
      console.error('Błąd podczas przygotowania nowej oferty:', error);
      setError('Nie udało się przygotować nowej oferty. Spróbuj ponownie.');
    }
  };

  const handleInitialFormSubmit = (data: { number: string; client: string; location: string }) => {
    setCurrentOfferData(data);
    setIsInitialFormOpen(false);
    setIsFormOpen(true);
  };

  const handleEditOffer = async (offer: StoredOffer) => {
    try {
      setError(null);
      await clearConstructions();
      await initializeConstructions(offer.constructions);
      setEditingOffer(offer);
      setCurrentOfferData({
        number: offer.number,
        client: offer.clientId,
        location: offer.location
      });
      setIsFormOpen(true);
    } catch (error) {
      console.error('Błąd podczas edycji oferty:', error);
      setError('Nie udało się załadować oferty do edycji. Spróbuj ponownie.');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę ofertę?')) {
      try {
        setError(null);
        await deleteOffer(id);
        await loadOffers();
      } catch (error) {
        console.error('Błąd podczas usuwania oferty:', error);
        setError('Nie udało się usunąć oferty. Spróbuj ponownie.');
      }
    }
  };

  const handleStatusChange = async (offer: StoredOffer, newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
    try {
      setError(null);
      const updatedOffer = {
        ...offer,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      await saveOffer(updatedOffer);
      await loadOffers();
    } catch (error) {
      console.error('Błąd podczas zmiany statusu oferty:', error);
      setError('Nie udało się zmienić statusu oferty. Spróbuj ponownie.');
    }
  };

  const handleDetailsUpdate = async (offer: StoredOffer, details: { number: string; client: string; location: string }) => {
    try {
      setError(null);
      const updatedOffer = {
        ...offer,
        number: details.number,
        clientId: details.client,
        location: details.location,
        updatedAt: new Date().toISOString()
      };
      await saveOffer(updatedOffer);
      await loadOffers();
      setEditingDetails(null);
    } catch (error) {
      console.error('Błąd podczas aktualizacji danych oferty:', error);
      setError('Nie udało się zaktualizować danych oferty. Spróbuj ponownie.');
    }
  };

  const handleSubmit = async (data: Partial<Offer>, constructions: Construction[]) => {
    try {
      setError(null);
      if (!currentOfferData) {
        throw new Error('Brak danych oferty');
      }

      if (constructions.length === 0) {
        alert('Dodaj przynajmniej jedną konstrukcję przed zapisaniem oferty.');
        return;
      }

      const offerToSave: StoredOffer = editingOffer ? {
        ...editingOffer,
        ...data,
        constructions,
        settings: data.settings,
        updatedAt: new Date().toISOString()
      } : {
        id: crypto.randomUUID(),
        number: currentOfferData.number,
        clientId: currentOfferData.client,
        location: currentOfferData.location,
        status: 'draft',
        detailLevel: 'detailed',
        items: [],
        materialsCost: data.materialsCost || 0,
        laborCost: data.laborCost || 0,
        totalCost: data.totalCost || 0,
        settings: data.settings,
        documents: [],
        constructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveOffer(offerToSave);
      await loadOffers();
      
      setIsFormOpen(false);
      setIsInitialFormOpen(false);
      setEditingOffer(null);
      setCurrentOfferData(null);
    } catch (error) {
      console.error('Błąd podczas zapisywania oferty:', error);
      setError('Nie udało się zapisać oferty. Spróbuj ponownie.');
    }
  };

  const handleCancel = async () => {
    if (confirm('Czy na pewno chcesz anulować? Wprowadzone zmiany zostaną utracone.')) {
      try {
        setError(null);
        await clearConstructions();
        setIsFormOpen(false);
        setIsInitialFormOpen(false);
        setEditingOffer(null);
        setCurrentOfferData(null);
      } catch (error) {
        console.error('Błąd podczas anulowania:', error);
        setError('Wystąpił błąd podczas anulowania. Spróbuj ponownie.');
      }
    }
  };

  if (isFormOpen) {
    return (
      <OfferForm
        initialData={editingOffer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onStatusChange={handleStatusChange}
      />
    );
  }

  if (isInitialFormOpen) {
    return (
      <InitialOfferForm
        onSubmit={handleInitialFormSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileEdit className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Oferty</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddOffer} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Nowa oferta</span>
            </button>
          </div>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileEdit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak aktywnych ofert
            </h3>
            <p className="mb-4">
              Dodaj swoją pierwszą ofertę, aby rozpocząć zarządzanie procesem ofertowania
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokalizacja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    {editingDetails?.id === offer.id ? (
                      <td colSpan={3} className="px-6 py-4">
                        <OfferDetailsEditor
                          number={offer.number}
                          client={offer.clientId}
                          location={offer.location}
                          onSave={(details) => handleDetailsUpdate(offer, details)}
                          onCancel={() => setEditingDetails(null)}
                        />
                      </td>
                    ) : (
                      <>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingDetails(offer)}
                        >
                          {offer.number}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingDetails(offer)}
                        >
                          {offer.clientId}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingDetails(offer)}
                        >
                          {offer.location}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={offer.status}
                        onChange={(e) => handleStatusChange(offer, e.target.value as 'draft' | 'sent' | 'accepted' | 'rejected')}
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          offer.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : offer.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : offer.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="draft">Szkic</option>
                        <option value="sent">Wysłana</option>
                        <option value="accepted">Zaakceptowana</option>
                        <option value="rejected">Odrzucona</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.totalCost?.toFixed(2) || '0.00'} PLN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}