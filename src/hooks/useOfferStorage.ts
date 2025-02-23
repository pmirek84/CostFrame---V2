import { useState, useCallback } from 'react';
import type { StoredOffer } from '../storage/offerStorage';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';

const OFFERS_STORAGE_KEY = 'costframe_offers';
const CLIENTS_STORAGE_KEY = 'costframe_clients';

export function useOfferStorage() {
  const [offers, setOffers] = useState<StoredOffer[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check connection on mount
  const checkConnection = useCallback(async () => {
    const connected = await checkSupabaseConnection();
    setIsConnected(connected);
    return connected;
  }, []);

  const loadOffers = useCallback(async () => {
    try {
      const connected = await checkConnection();
      
      if (connected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: supabaseOffers, error: supabaseError } = await supabase
            .from('offers')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

          if (supabaseError) throw supabaseError;

          if (supabaseOffers) {
            setOffers(supabaseOffers);
            // Also save to localStorage as backup
            localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(supabaseOffers));
            return supabaseOffers;
          }
        }
      }

      // Fallback to localStorage
      console.log('Using localStorage fallback');
      const offersJson = localStorage.getItem(OFFERS_STORAGE_KEY);
      const loadedOffers = offersJson ? JSON.parse(offersJson) : [];
      setOffers(loadedOffers);
      return loadedOffers;
    } catch (error) {
      console.error('Błąd podczas ładowania ofert:', error);
      // Fallback to localStorage on error
      const offersJson = localStorage.getItem(OFFERS_STORAGE_KEY);
      const loadedOffers = offersJson ? JSON.parse(offersJson) : [];
      setOffers(loadedOffers);
      return loadedOffers;
    }
  }, [checkConnection]);

  const updateClientName = useCallback((oldName: string, newName: string) => {
    try {
      // Load existing client mappings
      const clientsJson = localStorage.getItem(CLIENTS_STORAGE_KEY);
      const clients = clientsJson ? JSON.parse(clientsJson) : {};

      // Update mapping
      clients[oldName] = newName;

      // Save back to localStorage
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));

      // Update all offers with this client
      const updatedOffers = offers.map(offer => {
        if (offer.clientId === oldName) {
          return {
            ...offer,
            clientId: newName,
            updatedAt: new Date().toISOString()
          };
        }
        return offer;
      });

      setOffers(updatedOffers);
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updatedOffers));

      return updatedOffers;
    } catch (error) {
      console.error('Błąd podczas aktualizacji nazwy klienta:', error);
      throw error;
    }
  }, [offers]);

  const saveOffer = useCallback(async (offer: StoredOffer) => {
    try {
      const connected = await checkConnection();
      const currentOffers = [...offers];
      const existingIndex = currentOffers.findIndex(o => o.id === offer.id);
      const timestamp = new Date().toISOString();
      
      let updatedOffer: StoredOffer;
      
      if (existingIndex >= 0) {
        const existingOffer = currentOffers[existingIndex];
        updatedOffer = {
          ...offer,
          updatedAt: timestamp
        };
        currentOffers[existingIndex] = updatedOffer;

        // If client name changed, update the mapping
        if (existingOffer.clientId !== offer.clientId) {
          await updateClientName(existingOffer.clientId, offer.clientId);
        }
      } else {
        updatedOffer = {
          ...offer,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        currentOffers.push(updatedOffer);
      }

      // Always save to localStorage
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(currentOffers));
      
      if (connected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: supabaseError } = await supabase
            .from('offers')
            .upsert({
              ...updatedOffer,
              created_by: user.id
            });

          if (supabaseError) throw supabaseError;
        }
      }

      setOffers(currentOffers);
      return currentOffers;
    } catch (error) {
      console.error('Błąd podczas zapisywania oferty:', error);
      throw error;
    }
  }, [offers, checkConnection, updateClientName]);

  const deleteOffer = useCallback(async (id: string) => {
    try {
      const connected = await checkConnection();
      const currentOffers = offers.filter(offer => offer.id !== id);
      
      // Always update localStorage
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(currentOffers));
      
      if (connected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: supabaseError } = await supabase
            .from('offers')
            .delete()
            .eq('id', id)
            .eq('created_by', user.id);

          if (supabaseError) throw supabaseError;
        }
      }

      setOffers(currentOffers);
      return currentOffers;
    } catch (error) {
      console.error('Błąd podczas usuwania oferty:', error);
      throw error;
    }
  }, [offers, checkConnection]);

  const clearOffers = useCallback(async () => {
    try {
      const connected = await checkConnection();
      
      // Always clear localStorage
      localStorage.removeItem(OFFERS_STORAGE_KEY);
      localStorage.removeItem(CLIENTS_STORAGE_KEY);
      
      if (connected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: supabaseError } = await supabase
            .from('offers')
            .delete()
            .eq('created_by', user.id);

          if (supabaseError) throw supabaseError;
        }
      }

      setOffers([]);
    } catch (error) {
      console.error('Błąd podczas czyszczenia ofert:', error);
      throw error;
    }
  }, [checkConnection]);

  return {
    offers,
    isConnected,
    saveOffer,
    deleteOffer,
    clearOffers,
    loadOffers,
    checkConnection,
    updateClientName
  };
}