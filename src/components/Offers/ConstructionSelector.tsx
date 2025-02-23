import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Construction } from '../../types';
import CostModal from '../CostModal';
import { useConstructionStorage } from '../../hooks/useConstructionStorage';

interface ConstructionSelectorProps {
  onSelect: (construction: Construction) => void;
}

const calculateDimensions = (width: number, height: number, quantity: number) => {
  const area = (width * height) / 1000000; // konwersja z mm² na m²
  const perimeter = 2 * (width + height) / 1000; // konwersja z mm na m
  return {
    area,
    totalArea: area * quantity,
    perimeter,
    totalPerimeter: perimeter * quantity
  };
};

const calculateMaterialCosts = (dimensions: ReturnType<typeof calculateDimensions>) => {
  const materialCosts = {
    items: [
      {
        name: 'Śruby montażowe',
        quantity: Math.ceil(dimensions.perimeter * 0.5),
        unitPrice: 0.50,
        total: 0
      },
      {
        name: 'Kotwy',
        quantity: Math.ceil(dimensions.perimeter * 0.3),
        unitPrice: 1.50,
        total: 0
      },
      {
        name: 'Pianka montażowa',
        quantity: Math.ceil(dimensions.perimeter * 0.25),
        unitPrice: 40.00,
        total: 0
      }
    ],
    total: 0
  };

  materialCosts.items = materialCosts.items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice
  }));

  materialCosts.total = materialCosts.items.reduce((sum, item) => sum + item.total, 0);

  return materialCosts;
};

const calculateInstallationCosts = (dimensions: ReturnType<typeof calculateDimensions>, type: string, quantity: number) => {
  const rates = {
    'Okno PVC': 120,
    'Okno aluminiowe': 150,
    'Okno drewniane': 140,
    'Drzwi PVC': 200,
    'Drzwi aluminiowe': 250,
    'Drzwi drewniane': 220,
    'HST PVC': 300,
    'HST aluminiowy': 350,
    'HST drewniany': 330,
    'Pergola aluminiowa': 180,
    'Rolety zewnętrzne': 100,
    'Żaluzje fasadowe': 120,
    'ZIP Screeny': 90,
    'Fasada słupowo-ryglowa': 400
  };

  const rate = rates[type as keyof typeof rates] || 120;
  const total = type.toLowerCase().includes('drzwi') 
    ? rate * quantity
    : rate * dimensions.totalArea;

  return { rate, total };
};

export default function ConstructionSelector({ onSelect }: ConstructionSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveConstruction, loadConstructions } = useConstructionStorage();

  const modalFields = [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    { 
      name: 'type', 
      label: 'Typ', 
      type: 'select', 
      options: [
        'Okno PVC',
        'Okno aluminiowe',
        'Okno drewniane',
        'Drzwi PVC',
        'Drzwi aluminiowe',
        'Drzwi drewniane',
        'HST PVC',
        'HST aluminiowy',
        'HST drewniany',
        'Pergola aluminiowa',
        'Rolety zewnętrzne',
        'Żaluzje fasadowe',
        'ZIP Screeny',
        'Fasada słupowo-ryglowa'
      ], 
      required: true 
    },
    { name: 'width', label: 'Szerokość (mm)', type: 'number', required: true },
    { name: 'height', label: 'Wysokość (mm)', type: 'number', required: true },
    { name: 'quantity', label: 'Ilość', type: 'number', required: true },
    { 
      name: 'installationLocation', 
      label: 'Lokalizacja montażu', 
      type: 'select',
      options: ['wew', 'zew'],
      required: true 
    },
    { name: 'weight', label: 'Waga (kg)', type: 'number', required: true }
  ];

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Walidacja danych konstrukcji...');
      const width = parseFloat(data.width);
      const height = parseFloat(data.height);
      const quantity = parseInt(data.quantity, 10);
      const weight = parseFloat(data.weight);

      if (isNaN(width) || width <= 0) throw new Error('Nieprawidłowa szerokość');
      if (isNaN(height) || height <= 0) throw new Error('Nieprawidłowa wysokość');
      if (isNaN(quantity) || quantity <= 0) throw new Error('Nieprawidłowa ilość');
      if (isNaN(weight) || weight < 0) throw new Error('Nieprawidłowa waga');

      if (!data.type) throw new Error('Wybierz typ konstrukcji');
      if (!data.name) throw new Error('Podaj nazwę konstrukcji');
      if (!data.installationLocation) throw new Error('Wybierz lokalizację montażu');

      console.log('Obliczanie wymiarów i kosztów...');
      const dimensions = calculateDimensions(width, height, quantity);
      const materialCosts = calculateMaterialCosts(dimensions);
      const installationCosts = calculateInstallationCosts(dimensions, data.type, quantity);

      const constructionData: Partial<Construction> = {
        name: data.name,
        type: data.type,
        width,
        height,
        quantity,
        ...dimensions,
        installationLocation: data.installationLocation,
        weight,
        materialCosts,
        installationCosts,
        totalCost: materialCosts.total + installationCosts.total
      };

      console.log('Zapisywanie konstrukcji...', constructionData);
      const savedConstruction = await saveConstruction(constructionData);
      
      // Załaduj zaktualizowaną listę konstrukcji
      await loadConstructions();
      
      setIsModalOpen(false);
      
      if (onSelect && savedConstruction) {
        onSelect(savedConstruction);
      }

      // Reset form
      setError(null);
      setIsSubmitting(false);

      console.log('Proces dodawania konstrukcji zakończony');
    } catch (error) {
      console.error('Błąd podczas zapisywania konstrukcji:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania konstrukcji');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="btn-primary"
        disabled={isSubmitting}
      >
        <Plus className="h-4 w-4" />
        <span>{isSubmitting ? 'Dodawanie...' : 'Dodaj konstrukcję'}</span>
      </button>

      <CostModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setError(null);
          }
        }}
        onSubmit={handleSubmit}
        title="Dodaj nową konstrukcję"
        fields={modalFields}
        error={error}
      />
    </>
  );
}