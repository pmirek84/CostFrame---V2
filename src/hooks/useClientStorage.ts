import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Client } from '../types/client';

export function useClientStorage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Test Supabase connection
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      console.log('Current user:', user);

      const { data, error } = await supabase
        .from('clients')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
        throw error;
      }

      console.log('Supabase connection successful');
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      setError('Nie można połączyć się z bazą danych. Używam lokalnego magazynu.');
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load clients with fallback to localStorage
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await checkConnection();
      
      if (connected && supabase) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user?.id) {
          const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

          if (clientsError) throw clientsError;

          if (clients) {
            setClients(clients);
            // Also save to localStorage as backup
            localStorage.setItem('costframe_clients', JSON.stringify(clients));
            return clients;
          }
        }
      }

      // Fallback to localStorage
      console.log('Using localStorage fallback');
      const storedClients = localStorage.getItem('costframe_clients');
      const loadedClients = storedClients ? JSON.parse(storedClients) : [];
      setClients(loadedClients);
      return loadedClients;
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Nie udało się załadować klientów');
      // Fallback to localStorage
      const storedClients = localStorage.getItem('costframe_clients');
      const loadedClients = storedClients ? JSON.parse(storedClients) : [];
      setClients(loadedClients);
      return loadedClients;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Save client with fallback to localStorage
  const saveClient = useCallback(async (client: Partial<Client>) => {
    if (!client) {
      throw new Error('Client data is required');
    }

    try {
      setError(null);
      const connected = await checkConnection();
      
      if (connected && supabase) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user?.id) {
          const timestamp = new Date().toISOString();
          const clientData = {
            ...client,
            created_by: user.id,
            created_at: timestamp,
            updated_at: timestamp
          };

          const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setClients(prev => [...prev, data]);
            // Also save to localStorage as backup
            localStorage.setItem('costframe_clients', JSON.stringify([...clients, data]));
            return data;
          }
        }
      }

      // Fallback to localStorage
      const newClient = {
        ...client,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      localStorage.setItem('costframe_clients', JSON.stringify(updatedClients));
      return newClient;
    } catch (error) {
      console.error('Error saving client:', error);
      setError('Nie udało się zapisać klienta');
      throw error;
    }
  }, [clients, checkConnection]);

  // Delete client with fallback to localStorage
  const deleteClient = useCallback(async (id: string) => {
    if (!id) {
      throw new Error('Client ID is required');
    }

    try {
      setError(null);
      const connected = await checkConnection();
      
      if (connected && supabase) {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      // Always update local state and localStorage
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      localStorage.setItem('costframe_clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Nie udało się usunąć klienta');
      throw error;
    }
  }, [clients, checkConnection]);

  return {
    clients,
    isLoading,
    error,
    isConnected,
    loadClients,
    saveClient,
    deleteClient,
    checkConnection
  };
}