import React from 'react';
import { FileEdit, Eye, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import type { StoredOffer } from '../../storage/offerStorage';

interface ClientOffersProps {
  offers: StoredOffer[];
  onViewOffer?: (offer: StoredOffer) => void;
}

export default function ClientOffers({ offers, onViewOffer }: ClientOffersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Szkic';
      case 'sent':
        return 'Wysłana';
      case 'accepted':
        return 'Zaakceptowana';
      case 'rejected':
        return 'Odrzucona';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (offers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileEdit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Brak ofert
        </h3>
        <p className="text-sm text-gray-500">
          Nie przygotowano jeszcze żadnych ofert dla tego klienta
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => onViewOffer?.(offer)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <FileEdit className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">{offer.number}</h4>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(offer.status)}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(offer.status)}`}>
                {getStatusText(offer.status)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Data utworzenia</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wartość</p>
              <p className="text-sm font-medium text-gray-900">
                {offer.totalCost.toFixed(2)} PLN
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                Konstrukcje: {offer.constructions.length}
              </div>
              <button
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOffer?.(offer);
                }}
              >
                <Eye className="h-4 w-4" />
                <span>Zobacz szczegóły</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}