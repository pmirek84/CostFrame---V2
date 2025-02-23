import { useState, useEffect } from 'react';

interface InstallationRate {
  type: string;
  rate: number;
  unit: string;
}

const initialRates: InstallationRate[] = [
  { type: 'Okno', rate: 120, unit: 'm²' },
  { type: 'Drzwi', rate: 200, unit: 'szt.' },
  { type: 'HS', rate: 250, unit: 'm²' },
  { type: 'FIX', rate: 100, unit: 'm²' },
  { type: 'Witryna', rate: 180, unit: 'm²' }
];

export function useInstallationRates() {
  const [rates, setRates] = useState<InstallationRate[]>(initialRates);

  // TODO: W przyszłości dodać pobieranie z Supabase
  useEffect(() => {
    setRates(initialRates);
  }, []);

  const getRateForType = (type: string): InstallationRate | undefined => {
    return rates.find(rate => rate.type === type);
  };

  return {
    rates,
    getRateForType
  };
}