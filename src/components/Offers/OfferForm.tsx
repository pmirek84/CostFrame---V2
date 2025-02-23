import React, { useState, useEffect } from 'react';
import { FileText, Save, X, Package, Hammer, ChevronDown, ChevronRight, Printer } from 'lucide-react';
import { useConstructionStorage } from '../../hooks/useConstructionStorage';
import type { Construction } from '../../types';
import type { Offer } from '../../types/offer';
import type { StoredOffer } from '../../storage/offerStorage';
import ConstructionSelector from './ConstructionSelector';
import TransportSettings from '../TransportSettings';
import OfferSummary from './OfferSummary';
import InstallationRatesEditor from './InstallationRatesEditor';
import MaterialsSummary from './MaterialsSummary';
import OfferDetailsHeader from './OfferDetailsHeader';

interface OfferFormProps {
  initialData?: StoredOffer | null;
  onSubmit: (data: Partial<Offer>, constructions: Construction[]) => Promise<void>;
  onCancel: () => void;
  onStatusChange: (offer: StoredOffer, newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => Promise<void>;
}

// Default installation rates
const defaultInstallationRates = {
  'Okno PVC': { rate: 120, unit: 'm²' as const },
  'Okno aluminiowe': { rate: 150, unit: 'm²' as const },
  'Okno drewniane': { rate: 140, unit: 'm²' as const },
  'Drzwi PVC': { rate: 200, unit: 'szt.' as const },
  'Drzwi aluminiowe': { rate: 250, unit: 'szt.' as const },
  'Drzwi drewniane': { rate: 220, unit: 'szt.' as const },
  'HST PVC': { rate: 300, unit: 'm²' as const },
  'HST aluminiowy': { rate: 350, unit: 'm²' as const },
  'HST drewniany': { rate: 330, unit: 'm²' as const },
  'Pergola aluminiowa': { rate: 180, unit: 'm²' as const },
  'Rolety zewnętrzne': { rate: 100, unit: 'szt.' as const },
  'Żaluzje fasadowe': { rate: 120, unit: 'm²' as const },
  'ZIP Screeny': { rate: 90, unit: 'm²' as const },
  'Fasada słupowo-ryglowa': { rate: 400, unit: 'm²' as const }
};

export default function OfferForm({ initialData, onSubmit, onCancel, onStatusChange }: OfferFormProps) {
  const { constructions, loadConstructions, saveConstruction, deleteConstruction } = useConstructionStorage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    constructions: true,
    installationRates: true,
    materials: true,
    transport: true,
    summary: true
  });

  // Initialize installation rates from initial data or defaults
  const [installationRates, setInstallationRates] = useState(
    initialData?.settings?.installationRates || defaultInstallationRates
  );

  const [settings, setSettings] = useState({
    workTime: {
      workTime: 0,
      workerCount: 0,
      hourlyRate: 0
    },
    margin: 0,
    discount: 0
  });

  const [transportSettings, setTransportSettings] = useState({
    constructionTransport: {
      vehicleType: 'truck',
      roundTrips: 1,
      distance: 0,
      ratePerKm: 0
    },
    workerTransport: {
      vehicleType: 'van',
      roundTrips: 1,
      distance: 0,
      ratePerKm: 0
    },
    workTime: {
      workTime: 0,
      workerCount: 0,
      hourlyRate: 0
    }
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadConstructions();
      } catch (error) {
        console.error('Error loading constructions:', error);
        setError('Failed to load constructions');
      }
    };
    init();
  }, [loadConstructions]);

  // Get unique construction types from current constructions
  const usedConstructionTypes = Array.from(new Set(constructions.map(c => c.type)));

  // Filter installation rates to only show used types
  const usedRates = usedConstructionTypes.map(type => ({
    type,
    rate: installationRates[type]?.rate || 0,
    unit: installationRates[type]?.unit || 'm²'
  }));

  const recalculateInstallationCosts = (type: string, newRate: number, newUnit: 'm²' | 'mb' | 'szt.') => {
    return constructions.map(construction => {
      if (construction.type === type) {
        // Calculate new installation cost based on unit type
        let quantity = 1;
        switch (newUnit) {
          case 'm²':
            quantity = construction.totalArea;
            break;
          case 'mb':
            quantity = construction.totalPerimeter;
            break;
          case 'szt.':
            quantity = construction.quantity;
            break;
        }

        const newInstallationCost = newRate * quantity;

        return {
          ...construction,
          installationCosts: {
            rate: newRate,
            total: newInstallationCost
          },
          totalCost: construction.materialCosts.total + newInstallationCost
        };
      }
      return construction;
    });
  };

  const handleRateChange = async (type: string, rate: number) => {
    const currentUnit = installationRates[type]?.unit || 'm²';
    
    // Update rates
    setInstallationRates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        rate
      }
    }));

    // Recalculate costs for affected constructions
    const updatedConstructions = recalculateInstallationCosts(type, rate, currentUnit);
    
    // Save each updated construction
    for (const construction of updatedConstructions) {
      if (construction.type === type) {
        await saveConstruction(construction);
      }
    }

    await loadConstructions();
  };

  const handleUnitChange = async (type: string, unit: 'm²' | 'mb' | 'szt.') => {
    const currentRate = installationRates[type]?.rate || 0;
    
    // Update rates
    setInstallationRates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        unit
      }
    }));

    // Recalculate costs for affected constructions
    const updatedConstructions = recalculateInstallationCosts(type, currentRate, unit);
    
    // Save each updated construction
    for (const construction of updatedConstructions) {
      if (construction.type === type) {
        await saveConstruction(construction);
      }
    }

    await loadConstructions();
  };

  const handleConstructionAdded = async (construction: Construction) => {
    try {
      setError(null);
      
      // Get rate for this construction type
      const rate = installationRates[construction.type]?.rate || 0;
      const unit = installationRates[construction.type]?.unit || 'm²';
      
      // Calculate installation cost based on unit type
      let quantity = 1;
      switch (unit) {
        case 'm²':
          quantity = construction.totalArea;
          break;
        case 'mb':
          quantity = construction.totalPerimeter;
          break;
        case 'szt.':
          quantity = construction.quantity;
          break;
      }

      const installationCost = rate * quantity;
      
      // Update construction with calculated installation cost
      const constructionWithCosts = {
        ...construction,
        installationCosts: {
          rate,
          total: installationCost
        },
        totalCost: construction.materialCosts.total + installationCost
      };

      await saveConstruction(constructionWithCosts);
      await loadConstructions();
    } catch (error) {
      console.error('Error adding construction:', error);
      setError('Failed to add construction');
    }
  };

  const handleDeleteConstruction = async (id: string) => {
    try {
      setError(null);
      await deleteConstruction(id);
      await loadConstructions();
    } catch (error) {
      console.error('Error deleting construction:', error);
      setError('Failed to delete construction');
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
    if (initialData) {
      await onStatusChange(initialData, newStatus);
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (constructions.length === 0) {
        throw new Error('Dodaj przynajmniej jedną konstrukcję przed zapisaniem oferty');
      }

      const transportCosts = {
        constructionTransport: transportSettings.constructionTransport.distance * 
          transportSettings.constructionTransport.ratePerKm * 
          transportSettings.constructionTransport.roundTrips,
        workerTransport: transportSettings.workerTransport.distance * 
          transportSettings.workerTransport.ratePerKm * 
          transportSettings.workerTransport.roundTrips
      };

      const workTimeCost = transportSettings.workTime.workTime * 
        transportSettings.workTime.workerCount * 
        transportSettings.workTime.hourlyRate;

      const materialsCost = constructions.reduce((sum, c) => sum + c.materialCosts.total, 0);
      const installationCost = constructions.reduce((sum, c) => sum + c.installationCosts.total, 0);
      const subtotal = materialsCost + installationCost + 
        transportCosts.constructionTransport + transportCosts.workerTransport + workTimeCost;

      const marginAmount = (subtotal * settings.margin) / 100;
      const discountAmount = ((subtotal + marginAmount) * settings.discount) / 100;
      const totalCost = subtotal + marginAmount - discountAmount;

      await onSubmit({
        materialsCost,
        laborCost: installationCost + workTimeCost,
        totalCost,
        settings: {
          ...settings,
          workTime: transportSettings.workTime,
          installationRates
        }
      }, constructions);

    } catch (error) {
      console.error('Błąd podczas zapisywania oferty:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania oferty');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {initialData && (
        <OfferDetailsHeader
          offer={initialData}
          onStatusChange={handleStatusChange}
          onEdit={() => {/* Add edit functionality later */}}
        />
      )}

      {/* Add print button to the top right */}
      <div className="fixed top-4 right-4 z-10 print:hidden">
        <button
          onClick={handlePrint}
          className="btn-secondary mr-2"
          title="Drukuj ofertę"
        >
          <Printer className="h-4 w-4" />
          <span>Drukuj</span>
        </button>
      </div>

      {/* Constructions Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('constructions')}
          className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Konstrukcje</h2>
          </div>
          {expandedSections.constructions ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className={`transition-all duration-300 ease-in-out ${
          expandedSections.constructions ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-end mb-6">
              <ConstructionSelector onSelect={handleConstructionAdded} />
            </div>

            {constructions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nr
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Typ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wymiary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ilość
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materiały
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montaż
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {constructions.map((construction) => (
                      <tr key={construction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {construction.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.width} x {construction.height} mm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.quantity} szt.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.materialCosts.total.toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {construction.installationCosts.total.toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteConstruction(construction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Brak konstrukcji</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Dodaj pierwszą konstrukcję do oferty.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Installation Rates Section */}
      {usedRates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('installationRates')}
            className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Hammer className="h-6 w-6 text-[#1E3A8A]" />
              <h2 className="text-xl font-semibold text-[#1E3A8A]">Stawki montażowe</h2>
            </div>
            {expandedSections.installationRates ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          <div className={`transition-all duration-300 ease-in-out ${
            expandedSections.installationRates ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="p-6 border-t border-gray-100">
              <InstallationRatesEditor
                rates={usedRates}
                onRateChange={handleRateChange}
                onUnitChange={handleUnitChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Materials Summary Section */}
      {constructions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('materials')}
            className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-[#1E3A8A]" />
              <h2 className="text-xl font-semibold text-[#1E3A8A]">Materiały montażowe</h2>
            </div>
            {expandedSections.materials ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          <div className={`transition-all duration-300 ease-in-out ${
            expandedSections.materials ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="p-6 border-t border-gray-100">
              <MaterialsSummary constructions={constructions} />
            </div>
          </div>
        </div>
      )}

      {/* Transport Settings Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('transport')}
          className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Transport i czas pracy</h2>
          </div>
          {expandedSections.transport ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className={`transition-all duration-300 ease-in-out ${
          expandedSections.transport ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-6 border-t border-gray-100">
            <TransportSettings
              settings={transportSettings}
              onSettingsChange={setTransportSettings}
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Podsumowanie oferty</h2>
          </div>
          {expandedSections.summary ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className={`transition-all duration-300 ease-in-out ${
          expandedSections.summary ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-6 border-t border-gray-100">
            <OfferSummary
              constructions={constructions}
              transportCosts={{
                constructionTransport: transportSettings.constructionTransport.distance * 
                  transportSettings.constructionTransport.ratePerKm * 
                  transportSettings.constructionTransport.roundTrips,
                workerTransport: transportSettings.workerTransport.distance * 
                  transportSettings.workerTransport.ratePerKm * 
                  transportSettings.workerTransport.roundTrips
              }}
              workTimeCost={transportSettings.workTime.workTime * 
                transportSettings.workTime.workerCount * 
                transportSettings.workTime.hourlyRate}
              margin={settings.margin}
              discount={settings.discount}
              onSettingsChange={(newSettings) => setSettings({
                ...settings,
                ...newSettings
              })}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
          <span>Anuluj</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
          disabled={isLoading}
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Zapisywanie...' : 'Zapisz ofertę'}</span>
        </button>
      </div>

      {/* Add print styles */}
      <style type="text/css" media="print">{`
        @page { 
          size: A4;
          margin: 10mm;
        }
        body { 
          print-color-adjust: exact; 
          -webkit-print-color-adjust: exact;
        }
        .print:hidden {
          display: none !important;
        }
      `}</style>
    </div>
  );
}