import React, { useState, useEffect } from 'react';
import { Users2, Phone, Mail, Calendar, MessageSquare, FileText, Plus, Search, Filter, Edit2, Trash2, FileEdit } from 'lucide-react';
import type { Client } from '../../types/client';
import type { StoredOffer } from '../../storage/offerStorage';
import ClientForm from '../Clients/ClientForm';

type View = 'overview' | 'interactions' | 'tasks' | 'documents';

// Klucze do przechowywania danych w localStorage
const STORAGE_KEY = 'costframe_clients';
const OFFERS_STORAGE_KEY = 'costframe_offers';

export default function CRM() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [offers, setOffers] = useState<StoredOffer[]>([]);

  // Ładowanie klientów i ofert z localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Ładowanie klientów
        const savedClients = localStorage.getItem(STORAGE_KEY);
        if (savedClients) {
          setClients(JSON.parse(savedClients));
        }

        // Ładowanie ofert
        const savedOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
        if (savedOffers) {
          setOffers(JSON.parse(savedOffers));
        }
      } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
        setError('Nie udało się załadować danych');
      }
    };

    loadData();
  }, []);

  const getClientOffersCount = (clientId: string): number => {
    return offers.filter(offer => offer.clientId === clientId).length;
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Partial<Client>) => {
    try {
      setError(null);
      const timestamp = new Date().toISOString();

      if (editingClient) {
        // Aktualizacja istniejącego klienta
        const updatedClients = clients.map(client => 
          client.id === editingClient.id 
            ? {
                ...client,
                ...data,
                updated_at: timestamp
              }
            : client
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        setClients(updatedClients);
      } else {
        // Dodawanie nowego klienta
        const newClient: Client = {
          id: crypto.randomUUID(),
          created_by: 'local',
          ...data as Omit<Client, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
          created_at: timestamp,
          updated_at: timestamp
        };
        const updatedClients = [...clients, newClient];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
        setClients(updatedClients);
      }
      
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Błąd podczas zapisywania klienta:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego klienta?')) return;

    try {
      setError(null);
      const updatedClients = clients.filter(client => client.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (error) {
      console.error('Błąd podczas usuwania klienta:', error);
      setError('Nie udało się usunąć klienta');
    }
  };

  // Filtrowanie klientów
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const renderView = () => {
    if (isFormOpen) {
      return (
        <ClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      );
    }

    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Statystyki */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Wszyscy klienci</h3>
                <div className="text-3xl font-bold text-[#1E3A8A]">{clients.length}</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Aktywni</h3>
                <div className="text-3xl font-bold text-green-600">
                  {clients.filter(c => c.status === 'active').length}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Potencjalni</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {clients.filter(c => c.status === 'potential').length}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nieaktywni</h3>
                <div className="text-3xl font-bold text-gray-600">
                  {clients.filter(c => c.status === 'inactive').length}
                </div>
              </div>
            </div>

            {/* Lista klientów */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista klientów</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oferty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr 
                        key={client.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEditClient(client)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          {client && client.type === 'company' && client.nip && (
                            <div className="text-sm text-gray-500">NIP: {client.nip}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : client.status === 'potential'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status === 'active' ? 'Aktywny'
                              : client.status === 'potential' ? 'Potencjalny'
                              : 'Nieaktywny'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FileEdit className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-900 font-medium">
                              {getClientOffersCount(client.id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Zapobiega wywołaniu handleEditClient
                                handleEditClient(client);
                              }}
                              className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Zapobiega wywołaniu handleEditClient
                                handleDeleteClient(client.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
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
            </div>
          </div>
        );

      case 'interactions':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Historia interakcji</h3>
              <button className="btn-primary">
                <Plus className="h-4 w-4" />
                <span>Nowa interakcja</span>
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Brak historii interakcji</p>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Zadania</h3>
              <button className="btn-primary">
                <Plus className="h-4 w-4" />
                <span>Nowe zadanie</span>
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Brak zadań</p>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Dokumenty</h3>
              <button className="btn-primary">
                <Plus className="h-4 w-4" />
                <span>Dodaj dokument</span>
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Brak dokumentów</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">CRM</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Filter className="h-4 w-4" />
              <span>Filtry</span>
            </button>
            <button 
              onClick={handleAddClient}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Nowy kontakt</span>
            </button>
          </div>
        </div>

        {!isFormOpen && (
          <>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Szukaj klientów..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'overview'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Przegląd
              </button>
              <button
                onClick={() => setActiveView('interactions')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'interactions'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Interakcje
              </button>
              <button
                onClick={() => setActiveView('tasks')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'tasks'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Zadania
              </button>
              <button
                onClick={() => setActiveView('documents')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'documents'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dokumenty
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {renderView()}
    </div>
  );
}