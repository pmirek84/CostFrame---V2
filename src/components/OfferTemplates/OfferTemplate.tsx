import React from 'react';
import { FileText, Edit2 } from 'lucide-react';

interface OfferTemplateProps {
  data: {
    offerNumber: string;
    date: string;
    client: {
      name: string;
      address: string;
      postalCode: string;
      city: string;
    };
    subject: string;
    scope: string[];
    materials?: {
      byUs: string[];
      byClient: string[];
    };
    priceNet: number;
    priceGross: number;
    preparedBy: {
      name: string;
      email: string;
      phone: string;
    };
  };
  onEdit?: (field: string, value: any) => void;
}

export default function OfferTemplate({ data, onEdit }: OfferTemplateProps) {
  // Load company settings from localStorage
  const companySettings = (() => {
    try {
      const settings = localStorage.getItem('company_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading company settings:', error);
      return null;
    }
  })();

  const EditButton = ({ field, value }: { field: string; value: any }) => {
    if (!onEdit) return null;
    return (
      <button
        onClick={() => onEdit(field, value)}
        className="invisible group-hover:visible p-1 text-gray-400 hover:text-gray-600"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-start space-x-4">
          {companySettings?.logo && (
            <img 
              src={companySettings.logo} 
              alt={companySettings.name}
              className="h-16 w-auto"
            />
          )}
          <div className="text-sm">
            <p className="font-bold">{companySettings?.name || 'STOK SP. Z O.O.'}</p>
            <p>{companySettings?.address || 'ul. Józefa Mireckiego 2'}</p>
            <p>75-506 Koszalin</p>
            <p>{companySettings?.email || 'keller@stok-handel.eu'}</p>
          </div>
        </div>
        <div className="text-sm group">
          <p>
            Koszalin {data.date}
            <EditButton field="date" value={data.date} />
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <p className="font-bold mb-2">Zleceniodawca:</p>
        <div className="group">
          <div>
            <p>{data.client.name}</p>
            <p>{data.client.address}</p>
            <p>{data.client.postalCode} {data.client.city}</p>
          </div>
          <EditButton field="client" value={data.client} />
        </div>
      </div>

      {/* Offer Number */}
      <div className="text-center mb-8 group">
        <p className="font-bold">
          Oferta {data.offerNumber}
          <EditButton field="offerNumber" value={data.offerNumber} />
        </p>
      </div>

      {/* Subject */}
      <div className="mb-6 group">
        <p>
          <span className="font-bold">Dotyczy: </span>
          {data.subject}
          <EditButton field="subject" value={data.subject} />
        </p>
      </div>

      {/* Scope */}
      <div className="mb-8">
        <p className="font-bold mb-2">Oferta obejmuje:</p>
        <div className="group">
          <ol className="list-decimal pl-5 space-y-1">
            {data.scope.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
          <EditButton field="scope" value={data.scope} />
        </div>
      </div>

      {/* Materials */}
      {data.materials && (
        <div className="mb-8">
          <p className="mb-2">Materiały montażowe zostały podzielone zgodnie z poniższym:</p>
          <div className="pl-4">
            <div className="group">
              <p>7.1. STOK SP. Z O.O. – {data.materials.byUs.join(', ')}</p>
              <EditButton field="materials.byUs" value={data.materials.byUs} />
            </div>
            <div className="group">
              <p>7.2. {data.client.name} – {data.materials.byClient.join(', ')}</p>
              <EditButton field="materials.byClient" value={data.materials.byClient} />
            </div>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="mb-12">
        <div className="flex justify-end space-y-1">
          <div className="w-64 group">
            <div className="flex justify-between">
              <span>Cena netto:</span>
              <span>{data.priceNet.toFixed(2)} zł netto</span>
            </div>
            <div className="flex justify-between font-bold">
              <span></span>
              <span>{data.priceGross.toFixed(2)} zł brutto</span>
            </div>
            <EditButton field="price" value={{ net: data.priceNet, gross: data.priceGross }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 group">
        <p>Ofertę sporządził:</p>
        <p className="font-bold">{data.preparedBy.name}</p>
        <p>E-Mail: {data.preparedBy.email}</p>
        <p>Tel.: {data.preparedBy.phone}</p>
        <EditButton field="preparedBy" value={data.preparedBy} />
      </div>
    </div>
  );
}