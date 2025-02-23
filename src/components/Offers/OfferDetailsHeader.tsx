import React from 'react';
import { FileText, Users2, MapPin } from 'lucide-react';
import type { StoredOffer } from '../../storage/offerStorage';

interface OfferDetailsHeaderProps {
  offer: StoredOffer;
  onStatusChange: (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => void;
  onEdit: () => void;
}

export default function OfferDetailsHeader({ offer, onStatusChange, onEdit }: OfferDetailsHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Numer oferty */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-gray-500">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Numer oferty</span>
          </div>
          <p className="font-medium text-gray-900">{offer.number}</p>
        </div>

        {/* Klient */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-gray-500">
            <Users2 className="h-4 w-4" />
            <span className="text-sm">Klient</span>
          </div>
          <p className="font-medium text-gray-900">{offer.clientId}</p>
        </div>

        {/* Miejsce montażu */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Miejsce montażu</span>
          </div>
          <p className="font-medium text-gray-900">{offer.location}</p>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-500">Status</label>
          <select
            value={offer.status}
            onChange={(e) => onStatusChange(e.target.value as 'draft' | 'sent' | 'accepted' | 'rejected')}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg ${
              offer.status === 'draft'
                ? 'bg-gray-100 text-gray-800'
                : offer.status === 'sent'
                ? 'bg-blue-100 text-blue-800'
                : offer.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <option value="draft">Szkic</option>
            <option value="sent">Wysłana</option>
            <option value="accepted">Zaakceptowana</option>
            <option value="rejected">Odrzucona</option>
          </select>
        </div>
      </div>
    </div>
  );
}