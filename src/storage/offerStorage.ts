import type { Offer } from '../types/offer';
import type { Construction } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface StoredOffer extends Offer {
  constructions: Construction[];
}

export const offerStorage = {
  // Zapisywanie oferty
  saveOffer: async (offer: StoredOffer): Promise<void> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      const offers = await offerStorage.getAllOffers();
      const existingIndex = offers.findIndex(o => o.id === offer.id);
      
      if (existingIndex >= 0) {
        offers[existingIndex] = {
          ...offer,
          updatedAt: new Date().toISOString()
        };
      } else {
        offers.push({
          ...offer,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('costframe_offers', JSON.stringify(offers));
    } catch (error) {
      console.error('Błąd podczas zapisywania oferty:', error);
      throw error;
    }
  },

  // Pobieranie wszystkich ofert
  getAllOffers: async (): Promise<StoredOffer[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      const offersJson = localStorage.getItem('costframe_offers');
      return offersJson ? JSON.parse(offersJson) : [];
    } catch (error) {
      console.error('Błąd podczas pobierania ofert:', error);
      throw error;
    }
  },

  // Pobieranie pojedynczej oferty
  getOffer: async (id: string): Promise<StoredOffer | null> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      const offers = await offerStorage.getAllOffers();
      return offers.find(offer => offer.id === id) || null;
    } catch (error) {
      console.error('Błąd podczas pobierania oferty:', error);
      throw error;
    }
  },

  // Usuwanie oferty
  deleteOffer: async (id: string): Promise<void> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      const offers = await offerStorage.getAllOffers();
      const filteredOffers = offers.filter(offer => offer.id !== id);
      localStorage.setItem('costframe_offers', JSON.stringify(filteredOffers));
    } catch (error) {
      console.error('Błąd podczas usuwania oferty:', error);
      throw error;
    }
  },

  // Czyszczenie wszystkich ofert
  clearOffers: async (): Promise<void> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      localStorage.removeItem('costframe_offers');
    } catch (error) {
      console.error('Błąd podczas czyszczenia ofert:', error);
      throw error;
    }
  }
};