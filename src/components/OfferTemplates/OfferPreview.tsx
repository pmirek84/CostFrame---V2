import React from 'react';
import { FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface OfferPreviewProps {
  data: {
    offerNumber: string;
    date: string;
    client: {
      name: string;
      address: string;
    };
    subject: string;
    scope: string[];
    location: string;
    materials: {
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
  onExport?: () => void;
}

export default function OfferPreview({ data }: OfferPreviewProps) {
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

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Add company logo if available
    if (companySettings?.logo) {
      doc.addImage(companySettings.logo, 'PNG', margin, yPos, 40, 20);
      yPos += 25;
    }

    // Company header
    doc.setFontSize(16);
    doc.text(companySettings?.name || 'STOK SP. Z O.O.', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(companySettings?.address || 'ul. Józefa Mireckiego 2', margin, yPos);
    yPos += 5;
    doc.text('75-506 Koszalin', margin, yPos);
    yPos += 5;
    doc.text(companySettings?.email || 'keller@stok-handel.eu', margin, yPos);
    yPos += 10;

    // Offer number and date
    doc.text(`Koszalin, ${data.date}`, pageWidth - margin - 40, 20);
    doc.text(`Oferta ${data.offerNumber}`, pageWidth - margin - 40, 27);

    // Client info
    yPos += 10;
    doc.setFontSize(12);
    doc.text('Zleceniodawca:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(data.client.name, margin + 5, yPos);
    yPos += 5;
    doc.text(data.client.address, margin + 5, yPos);
    yPos += 10;

    // Subject
    doc.setFontSize(12);
    doc.text('Dotyczy:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(data.subject, margin + 5, yPos);
    yPos += 10;

    // Scope
    doc.setFontSize(12);
    doc.text('Oferta obejmuje:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    data.scope.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`, margin + 5, yPos);
      yPos += 7;
    });

    // Materials
    yPos += 5;
    doc.setFontSize(12);
    doc.text('Materiały montażowe:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text('STOK SP. Z O.O.:', margin + 5, yPos);
    yPos += 7;
    data.materials.byUs.forEach(item => {
      doc.text(`• ${item}`, margin + 10, yPos);
      yPos += 5;
    });
    yPos += 5;
    doc.text('Zleceniodawca:', margin + 5, yPos);
    yPos += 7;
    data.materials.byClient.forEach(item => {
      doc.text(`• ${item}`, margin + 10, yPos);
      yPos += 5;
    });

    // Price
    yPos += 10;
    doc.text(`Cena netto: ${data.priceNet.toFixed(2)} PLN`, pageWidth - margin - 60, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Cena brutto: ${data.priceGross.toFixed(2)} PLN`, pageWidth - margin - 60, yPos);

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 40;
    doc.setFontSize(10);
    doc.text('Ofertę sporządził:', margin, yPos);
    yPos += 7;
    doc.text(data.preparedBy.name, margin, yPos);
    yPos += 5;
    doc.text(`E-Mail: ${data.preparedBy.email}`, margin, yPos);
    yPos += 5;
    doc.text(`Tel.: ${data.preparedBy.phone}`, margin, yPos);

    // Save the PDF
    doc.save(`Oferta_${data.offerNumber}.pdf`);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start space-x-4">
          {companySettings?.logo && (
            <img 
              src={companySettings.logo} 
              alt={companySettings.name}
              className="h-16 w-auto"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{companySettings?.name || 'STOK SP. Z O.O.'}</h1>
            <p className="text-gray-600">{companySettings?.address || 'ul. Józefa Mireckiego 2'}</p>
            <p className="text-gray-600">75-506 Koszalin</p>
            <p className="text-gray-600">{companySettings?.email || 'keller@stok-handel.eu'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Koszalin, {data.date}</p>
          <h2 className="text-lg font-semibold mt-2">Oferta {data.offerNumber}</h2>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Zleceniodawca:</h3>
        <div className="pl-4">
          <p className="text-gray-800">{data.client.name}</p>
          <p className="text-gray-800">{data.client.address}</p>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Dotyczy:</h3>
        <p className="text-gray-800 pl-4">{data.subject}</p>
      </div>

      {/* Scope */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Oferta obejmuje:</h3>
        <ol className="list-decimal pl-8 space-y-2">
          {data.scope.map((item, index) => (
            <li key={index} className="text-gray-800">{item}</li>
          ))}
        </ol>
      </div>

      {/* Materials */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Materiały montażowe:</h3>
        <div className="pl-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">STOK SP. Z O.O.:</h4>
            <ul className="list-disc pl-8">
              {data.materials.byUs.map((item, index) => (
                <li key={index} className="text-gray-800">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Zleceniodawca:</h4>
            <ul className="list-disc pl-8">
              {data.materials.byClient.map((item, index) => (
                <li key={index} className="text-gray-800">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex justify-end space-y-2">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Cena netto:</span>
              <span className="text-gray-800">{data.priceNet.toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-bold">Cena brutto:</span>
              <span className="font-bold">{data.priceGross.toFixed(2)} PLN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <p className="text-gray-600">Ofertę sporządził:</p>
        <p className="font-medium">{data.preparedBy.name}</p>
        <p className="text-gray-600">E-Mail: {data.preparedBy.email}</p>
        <p className="text-gray-600">Tel.: {data.preparedBy.phone}</p>
      </div>

      {/* Export button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleExportToPDF}
          className="btn-primary"
        >
          <FileText className="h-4 w-4" />
          <span>Eksportuj do PDF</span>
        </button>
      </div>
    </div>
  );
}