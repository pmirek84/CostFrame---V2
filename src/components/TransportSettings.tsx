import React from 'react';
import { Truck, Users, Clock } from 'lucide-react';

interface TransportSettings {
  constructionTransport: {
    vehicleType: string;
    roundTrips: number;
    distance: number;
    ratePerKm: number;
  };
  workerTransport: {
    vehicleType: string;
    roundTrips: number;
    distance: number;
    ratePerKm: number;
  };
  workTime: {
    workTime: number;
    workerCount: number;
    hourlyRate: number;
  };
}

interface TransportSettingsProps {
  settings: TransportSettings;
  onSettingsChange: (settings: TransportSettings) => void;
}

const TRANSPORT_SETTINGS_KEY = 'costframe_transport_settings';

export default function TransportSettings({ settings, onSettingsChange }: TransportSettingsProps) {
  // Załaduj zapisane ustawienia przy pierwszym renderowaniu
  React.useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(TRANSPORT_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        onSettingsChange(parsedSettings);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania ustawień transportu:', error);
    }
  }, [onSettingsChange]);

  const handleConstructionTransportChange = (field: string, value: string | number) => {
    const newSettings = {
      ...settings,
      constructionTransport: {
        ...settings.constructionTransport,
        [field]: typeof value === 'string' ? value : Number(value)
      }
    };
    
    // Zapisz do localStorage
    try {
      localStorage.setItem(TRANSPORT_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień transportu:', error);
    }
    
    onSettingsChange(newSettings);
  };

  const handleWorkerTransportChange = (field: string, value: string | number) => {
    const newSettings = {
      ...settings,
      workerTransport: {
        ...settings.workerTransport,
        [field]: typeof value === 'string' ? value : Number(value)
      }
    };
    
    // Zapisz do localStorage
    try {
      localStorage.setItem(TRANSPORT_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień transportu:', error);
    }
    
    onSettingsChange(newSettings);
  };

  const handleWorkTimeChange = (field: string, value: number) => {
    const newSettings = {
      ...settings,
      workTime: {
        ...settings.workTime,
        [field]: Number(value)
      }
    };
    
    // Zapisz do localStorage
    try {
      localStorage.setItem(TRANSPORT_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień transportu:', error);
    }
    
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transport konstrukcji */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-[#1E3A8A]">
            <Truck className="h-5 w-5" />
            <h4 className="font-medium">Transport konstrukcji</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Typ pojazdu</label>
              <select
                value={settings.constructionTransport.vehicleType}
                onChange={(e) => handleConstructionTransportChange('vehicleType', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="truck">Ciężarówka</option>
                <option value="specialized">Pojazd specjalistyczny</option>
                <option value="van">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Liczba kursów</label>
              <input
                type="number"
                min="0"
                value={settings.constructionTransport.roundTrips}
                onChange={(e) => handleConstructionTransportChange('roundTrips', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Odległość (km)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={settings.constructionTransport.distance}
                onChange={(e) => handleConstructionTransportChange('distance', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stawka za km (PLN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.constructionTransport.ratePerKm}
                onChange={(e) => handleConstructionTransportChange('ratePerKm', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transport pracowników */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-[#1E3A8A]">
            <Users className="h-5 w-5" />
            <h4 className="font-medium">Transport pracowników</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Typ pojazdu</label>
              <select
                value={settings.workerTransport.vehicleType}
                onChange={(e) => handleWorkerTransportChange('vehicleType', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="van">Van</option>
                <option value="car">Samochód osobowy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Liczba kursów</label>
              <input
                type="number"
                min="0"
                value={settings.workerTransport.roundTrips}
                onChange={(e) => handleWorkerTransportChange('roundTrips', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Odległość (km)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={settings.workerTransport.distance}
                onChange={(e) => handleWorkerTransportChange('distance', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stawka za km (PLN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.workerTransport.ratePerKm}
                onChange={(e) => handleWorkerTransportChange('ratePerKm', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Czas pracy */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-[#1E3A8A] mb-4">
          <Clock className="h-5 w-5" />
          <h4 className="font-medium">Czas pracy (opcjonalnie)</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Czas pracy (h)</label>
            <input
              type="number"
              min="0"
              value={settings.workTime.workTime}
              onChange={(e) => handleWorkTimeChange('workTime', Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Liczba pracowników</label>
            <input
              type="number"
              min="0"
              value={settings.workTime.workerCount}
              onChange={(e) => handleWorkTimeChange('workerCount', Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stawka godzinowa (PLN)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.workTime.hourlyRate}
              onChange={(e) => handleWorkTimeChange('hourlyRate', Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}