import React from 'react';
import { FileText, Box, PenTool as Tool, Truck, Users } from 'lucide-react';
import type { Construction } from '../../types';

interface OfferSummaryProps {
  constructions: Construction[];
  transportCosts: {
    constructionTransport: number;
    workerTransport: number;
  };
  workTimeCost: number;
  margin: number;
  discount: number;
  onSettingsChange: (settings: { margin: number; discount: number }) => void;
}

export default function OfferSummary({ 
  constructions, 
  transportCosts, 
  workTimeCost,
  margin,
  discount,
  onSettingsChange
}: OfferSummaryProps) {
  const totalMaterialsCost = constructions.reduce((sum, c) => sum + c.materialCosts.total, 0);
  const totalInstallationCost = constructions.reduce((sum, c) => sum + c.installationCosts.total, 0);
  const totalTransportCost = transportCosts.constructionTransport + transportCosts.workerTransport;
  const subtotal = totalMaterialsCost + totalInstallationCost + totalTransportCost + workTimeCost;
  
  const marginAmount = (subtotal * margin) / 100;
  const discountAmount = ((subtotal + marginAmount) * discount) / 100;
  const grandTotal = subtotal + marginAmount - discountAmount;
  
  const totalWeight = constructions.reduce((sum, c) => sum + (c.weight * c.quantity), 0);
  const totalQuantity = constructions.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">
          Szczegółowe podsumowanie oferty
        </h3>

        {/* Zestawienie konstrukcji */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Box className="h-5 w-5 text-[#1E3A8A]" />
            <h4 className="font-medium text-gray-900">
              Konstrukcje (łącznie: {totalQuantity} szt., {totalWeight.toFixed(2)} kg)
            </h4>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500">Typ</th>
                  <th className="text-left text-sm font-medium text-gray-500">Ilość</th>
                  <th className="text-left text-sm font-medium text-gray-500">Powierzchnia</th>
                  <th className="text-left text-sm font-medium text-gray-500">Obwód</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {constructions.map((construction) => (
                  <tr key={construction.id}>
                    <td className="py-2 text-sm text-gray-900">{construction.type}</td>
                    <td className="py-2 text-sm text-gray-900">{construction.quantity} szt.</td>
                    <td className="py-2 text-sm text-gray-900">{construction.totalArea.toFixed(2)} m²</td>
                    <td className="py-2 text-sm text-gray-900">{construction.totalPerimeter.toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zestawienie kosztów */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Tool className="h-5 w-5 text-[#1E3A8A]" />
            <h4 className="font-medium text-gray-900">Koszty</h4>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Materiały montażowe:</span>
                <span>{totalMaterialsCost.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Robocizna (stawki montażowe):</span>
                <span>{totalInstallationCost.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Transport konstrukcji:</span>
                <span>{transportCosts.constructionTransport.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Transport pracowników:</span>
                <span>{transportCosts.workerTransport.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Koszt pracy:</span>
                <span>{workTimeCost.toFixed(2)} PLN</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between text-sm font-medium text-gray-900">
                <span>Suma częściowa:</span>
                <span>{subtotal.toFixed(2)} PLN</span>
              </div>
            </div>

            {/* Marża */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marża (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={margin}
                  onChange={(e) => onSettingsChange({
                    margin: parseFloat(e.target.value) || 0,
                    discount
                  })}
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="text-sm text-gray-500">
                  ({marginAmount.toFixed(2)} PLN)
                </span>
              </div>
            </div>

            {/* Rabat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rabat (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discount}
                  onChange={(e) => onSettingsChange({
                    margin,
                    discount: parseFloat(e.target.value) || 0
                  })}
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="text-sm text-gray-500">
                  ({discountAmount.toFixed(2)} PLN)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Podsumowanie końcowe */}
        <div className="bg-[#1E3A8A] text-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <FileText className="h-6 w-6 mb-2" />
              <h4 className="font-medium">Wartość całkowita</h4>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{grandTotal.toFixed(2)} PLN</div>
              <div className="text-sm opacity-75">netto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}