import React, { useState, useEffect } from 'react';
import { Users2, Plus, Download, Search, ArrowUpDown, Edit2, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { Client } from '../../types/client';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user?.id) {
          setClients([]);
          return;
        }

        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('created_by', user.id)
          .order('name');

        if (clientsError) throw clientsError;

        // Ensure all required fields are present with proper type safety
        const validClients = (clientsData || []).map((client: any): Client => ({
          ...client,
          type: client.type || 'company',
          status: client.status || 'potential',
          created_at: client.created_at || new Date().toISOString(),
          updated_at: client.updated_at || new Date().toISOString()
        }));

        setClients(validClients);
      } catch (error) {
        console.error('Error loading clients:', error);
        setError('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [user]);

  const handleAddClient = () => {
    if (!user) {
      setError('Musisz być zalogowany aby dodać klienta');
      return;
    }
    setEditingClient(null);
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    if (!user) {
      setError('Musisz być zalogowany aby edytować klienta');
      return;
    }
    if (!client) return;
    setEditingClient(client);
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleViewDetails = (client: Client) => {
    if (!client) return;
    setSelectedClient(client);
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (!user) {
      setError('Musisz być zalogowany aby usunąć klienta');
      return;
    }

    if (!confirm('Czy na pewno chcesz usunąć tego klienta?')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;

      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Błąd podczas usuwania klienta:', error);
      setError('Nie udało się usunąć klienta');
    }
  };

  const handleSubmit = async (data: Partial<Client>) => {
    if (!user) {
      setError('Musisz być zalogowany aby zapisać klienta');
      return;
    }

    try {
      setError(null);
      const timestamp = new Date().toISOString();

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            ...data,
            updated_at: timestamp
          })
          .eq('id', editingClient.id)
          .eq('created_by', user.id);

        if (error) throw error;

        setClients(clients.map(client =>
          client.id === editingClient.id
            ? { ...client, ...data, updated_at: timestamp }
            : client
        ));
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert([{
            ...data,
            created_by: user.id,
            created_at: timestamp,
            updated_at: timestamp
          }])
          .select()
          .single();

        if (error) throw error;
        if (newClient) {
          setClients([...clients, newClient]);
        }
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

  const handleSort = (key: 'name' | 'status') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    client.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  // Render client details if a client is selected
  if (selectedClient) {
    return (
      <ClientDetails
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onEdit={() => {
          setEditingClient(selectedClient);
          setSelectedClient(null);
          setIsFormOpen(true);
        }}
        onDelete={async () => {
          await handleDeleteClient(selectedClient.id);
          setSelectedClient(null);
        }}
      />
    );
  }

  // Render client form if form is open
  if (isFormOpen) {
    return (
      <ClientForm
        client={editingClient}
        onSubmit={handleSubmit}
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
            <Users2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Klienci</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button 
              onClick={handleAddClient} 
              className="btn-primary"
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>Nowy klient</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po nazwie, emailu lub statusie..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={() => handleSort('name')} className="btn-secondary">
            <span>Sortuj po nazwie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('status')} className="btn-secondary">
            <span>Sortuj po statusie</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto"></div>
          <p className="mt-4 text-gray-500">Ładowanie klientów...</p>
        </div>
      ) : sortedClients.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => handleViewDetails(client)}
                    >
                      {client.name}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak klientów
          </h3>
          <p className="mb-4">
            Dodaj swojego pierwszego klienta, aby rozpocząć zarządzanie bazą klientów
          </p>
        </div>
      )}
    </div>
  );
}