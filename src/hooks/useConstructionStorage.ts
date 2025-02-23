import { useState, useCallback } from 'react';
import type { Construction } from '../types';

const CONSTRUCTIONS_STORAGE_KEY = 'costframe_constructions';

export function useConstructionStorage() {
  const [constructions, setConstructions] = useState<Construction[]>([]);

  const loadConstructions = useCallback(async () => {
    console.log('🔄 Ładowanie konstrukcji...');
    try {
      const storedData = localStorage.getItem(CONSTRUCTIONS_STORAGE_KEY);
      console.log('📦 Dane z localStorage:', storedData);
      
      const loadedConstructions = storedData ? JSON.parse(storedData) : [];
      console.log('📥 Załadowane konstrukcje:', loadedConstructions);
      
      setConstructions(loadedConstructions);
      return loadedConstructions;
    } catch (error) {
      console.error('❌ Błąd podczas ładowania konstrukcji:', error);
      return [];
    }
  }, []);

  const saveConstruction = useCallback(async (constructionData: Partial<Construction>): Promise<Construction> => {
    console.log('💾 Rozpoczęcie zapisywania konstrukcji...', constructionData);
    try {
      // Pobierz aktualną listę konstrukcji
      const storedData = localStorage.getItem(CONSTRUCTIONS_STORAGE_KEY);
      console.log('📦 Aktualne dane z localStorage:', storedData);
      
      const currentConstructions = storedData ? JSON.parse(storedData) : [];
      console.log('📋 Lista obecnych konstrukcji:', currentConstructions);

      let updatedConstructions;
      let newConstruction;
      
      if (constructionData.id) {
        // Aktualizacja istniejącej konstrukcji
        updatedConstructions = currentConstructions.map((c: Construction) => 
          c.id === constructionData.id ? { ...c, ...constructionData } : c
        );
        newConstruction = updatedConstructions.find((c: Construction) => c.id === constructionData.id);
      } else {
        // Dodawanie nowej konstrukcji
        const maxNumber = currentConstructions.length > 0 
          ? Math.max(...currentConstructions.map((c: Construction) => c.number))
          : 0;
        console.log('🔢 Następny numer konstrukcji:', maxNumber + 1);

        const timestamp = new Date().toISOString();
        newConstruction = {
          id: crypto.randomUUID(),
          number: maxNumber + 1,
          name: constructionData.name || '',
          type: constructionData.type || '',
          width: constructionData.width || 0,
          height: constructionData.height || 0,
          quantity: constructionData.quantity || 0,
          area: constructionData.area || 0,
          totalArea: constructionData.totalArea || 0,
          perimeter: constructionData.perimeter || 0,
          totalPerimeter: constructionData.totalPerimeter || 0,
          installationLocation: constructionData.installationLocation || 'wew',
          weight: constructionData.weight || 0,
          materialCosts: constructionData.materialCosts || { items: [], total: 0 },
          installationCosts: constructionData.installationCosts || { rate: 0, total: 0 },
          totalCost: constructionData.totalCost || 0,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        updatedConstructions = [...currentConstructions, newConstruction];
      }

      console.log('📝 Zaktualizowana lista konstrukcji:', updatedConstructions);
      
      // Zapisz do localStorage
      localStorage.setItem(CONSTRUCTIONS_STORAGE_KEY, JSON.stringify(updatedConstructions));
      console.log('💾 Zapisano do localStorage');
      
      // Zaktualizuj stan
      setConstructions(updatedConstructions);
      console.log('🔄 Zaktualizowano stan komponentu');

      return newConstruction;
    } catch (error) {
      console.error('❌ Błąd podczas zapisywania konstrukcji:', error);
      throw error;
    }
  }, []);

  const deleteConstruction = useCallback(async (id: string) => {
    console.log('🗑️ Usuwanie konstrukcji:', id);
    try {
      const storedData = localStorage.getItem(CONSTRUCTIONS_STORAGE_KEY);
      console.log('📦 Aktualne dane z localStorage:', storedData);
      
      const currentConstructions = storedData ? JSON.parse(storedData) : [];
      console.log('📋 Lista obecnych konstrukcji:', currentConstructions);
      
      const updatedConstructions = currentConstructions
        .filter((c: Construction) => c.id !== id)
        .map((c: Construction, index: number) => ({ ...c, number: index + 1 }));

      console.log('📝 Lista po usunięciu:', updatedConstructions);
      
      localStorage.setItem(CONSTRUCTIONS_STORAGE_KEY, JSON.stringify(updatedConstructions));
      console.log('💾 Zapisano do localStorage');
      
      setConstructions(updatedConstructions);
      console.log('🔄 Zaktualizowano stan komponentu');
      
      return true;
    } catch (error) {
      console.error('❌ Błąd podczas usuwania konstrukcji:', error);
      throw error;
    }
  }, []);

  const clearConstructions = useCallback(async () => {
    console.log('🧹 Czyszczenie listy konstrukcji...');
    try {
      localStorage.removeItem(CONSTRUCTIONS_STORAGE_KEY);
      console.log('🗑️ Wyczyszczono localStorage');
      
      setConstructions([]);
      console.log('🔄 Wyczyszczono stan komponentu');
    } catch (error) {
      console.error('❌ Błąd podczas czyszczenia konstrukcji:', error);
      throw error;
    }
  }, []);

  const initializeConstructions = useCallback(async (initialConstructions: Construction[]) => {
    console.log('🎬 Inicjalizacja konstrukcji:', initialConstructions);
    try {
      const timestamp = new Date().toISOString();
      const updatedConstructions = initialConstructions.map((c, index) => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        number: index + 1,
        createdAt: timestamp,
        updatedAt: timestamp
      }));

      console.log('📝 Przygotowane konstrukcje:', updatedConstructions);
      
      localStorage.setItem(CONSTRUCTIONS_STORAGE_KEY, JSON.stringify(updatedConstructions));
      console.log('💾 Zapisano do localStorage');
      
      setConstructions(updatedConstructions);
      console.log('🔄 Zaktualizowano stan komponentu');
      
      return updatedConstructions;
    } catch (error) {
      console.error('❌ Błąd podczas inicjalizacji konstrukcji:', error);
      throw error;
    }
  }, []);

  return {
    constructions,
    saveConstruction,
    deleteConstruction,
    clearConstructions,
    loadConstructions,
    initializeConstructions
  };
}