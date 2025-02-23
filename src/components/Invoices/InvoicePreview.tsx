import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText, ArrowLeft, Printer } from 'lucide-react';
import 'jspdf-autotable';

function numberToWords(amount: number): string {
  const units = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
  const teens = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
  const tens = ['', 'dziesięć', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
  const hundreds = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
  const thousands = ['', 'tysiąc', 'tysiące', 'tysięcy'];

  function getThousandsSuffix(number: number): string {
    if (number === 1) return thousands[1];
    if (number >= 2 && number <= 4) return thousands[2];
    return thousands[3];
  }

  function convertGroup(n: number): string {
    if (n === 0) return '';
    
    let result = '';
    
    // Hundreds
    const h = Math.floor(n / 100);
    if (h > 0) {
      result += hundreds[h] + ' ';
    }
    
    // Tens and units
    const tu = n % 100;
    if (tu > 0) {
      if (tu < 10) {
        result += units[tu] + ' ';
      } else if (tu < 20) {
        result += teens[tu - 10] + ' ';
      } else {
        const t = Math.floor(tu / 10);
        const u = tu % 10;
        result += tens[t] + ' ';
        if (u > 0) {
          result += units[u] + ' ';
        }
      }
    }
    
    return result;
  }

  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);

  let result = '';

  if (wholePart === 0) {
    result = 'zero';
  } else {
    // Handle thousands
    const thousands = Math.floor(wholePart / 1000);
    const remainder = wholePart % 1000;

    if (thousands > 0) {
      if (thousands === 1) {
        result += 'jeden tysiąc ';
      } else {
        result += convertGroup(thousands) + getThousandsSuffix(thousands) + ' ';
      }
    }

    // Handle remainder
    if (remainder > 0) {
      result += convertGroup(remainder);
    }
  }

  // Add decimal part
  result = result.trim() + ` ${decimalPart}/100 złotych`;

  return result.charAt(0).toUpperCase() + result.slice(1);
}

interface InvoicePreviewProps {
  data: {
    number: string;
    issueDate: string;
    saleDate?: string;
    dueDate: string;
    paymentMethod: 'transfer' | 'cash' | 'card';
    paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
    seller: {
      name: string;
      address: string;
      postalCode: string;
      city: string;
      nip: string;
      email?: string;
      phone?: string;
      bankName?: string;
      bankAccount?: string;
      logo?: string;
    };
    buyer: {
      name: string;
      address: string;
      postalCode: string;
      city: string;
      nip?: string;
      email?: string;
      phone?: string;
    };
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      discount?: number;
      netPrice: number;
      taxRate: number;
      netAmount: number;
      taxAmount: number;
      grossAmount: number;
    }>;
    summary: {
      totalNet: number;
      totalTax: number;
      totalGross: number;
    };
    notes?: string;
    issuer: {
      name: string;
      position?: string;
    };
  };
  onBack: () => void;
}

export default function InvoicePreview({ data, onBack }: InvoicePreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Add logo if available
    if (data.seller.logo) {
      doc.addImage(data.seller.logo, 'PNG', margin, yPos, 40, 20);
      yPos += 25;
    }

    // Header
    doc.setFontSize(10);
    doc.text(`Miejscowość i data: ${data.seller.city}, ${data.issueDate}`, margin, yPos);
    yPos += 10;

    // Invoice title and number
    doc.setFontSize(16);
    doc.text('FAKTURA VAT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Nr ${data.number}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Seller and Buyer sections
    doc.setFontSize(11);
    doc.text('Sprzedawca:', margin, yPos);
    doc.text('Nabywca:', pageWidth / 2 + margin, yPos);
    yPos += 7;
    doc.setFontSize(10);

    // Seller details
    const sellerInfo = [
      data.seller.name,
      data.seller.address,
      `${data.seller.postalCode} ${data.seller.city}`,
      `NIP: ${data.seller.nip}`,
      data.seller.email && `E-mail: ${data.seller.email}`,
      data.seller.phone && `Tel: ${data.seller.phone}`
    ].filter(Boolean);

    sellerInfo.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // Reset Y position for buyer info
    yPos -= sellerInfo.length * 5;

    // Buyer details
    const buyerInfo = [
      data.buyer.name,
      data.buyer.address,
      `${data.buyer.postalCode} ${data.buyer.city}`,
      data.buyer.nip && `NIP: ${data.buyer.nip}`
    ].filter(Boolean);

    buyerInfo.forEach(line => {
      doc.text(line, pageWidth / 2 + margin, yPos);
      yPos += 5;
    });

    yPos += 15;

    // Payment method and dates
    doc.text(`Sposób płatności: ${
      data.paymentMethod === 'transfer' ? 'Przelew' :
      data.paymentMethod === 'cash' ? 'Gotówka' : 'Karta'
    }`, margin, yPos);
    yPos += 5;
    doc.text(`Termin płatności: ${data.dueDate}`, margin, yPos);
    yPos += 10;

    // Items table
    doc.autoTable({
      startY: yPos,
      head: [[
        'LP',
        'Nazwa towaru/usługi',
        'Ilość',
        'J.m.',
        'Cena netto',
        'Wartość netto',
        'VAT %',
        'Kwota VAT',
        'Wartość brutto'
      ]],
      body: data.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        item.unit,
        item.netPrice.toFixed(2),
        item.netAmount.toFixed(2),
        `${item.taxRate}%`,
        item.taxAmount.toFixed(2),
        item.grossAmount.toFixed(2)
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Payment details
    if (data.seller.bankAccount) {
      doc.text('Dane do przelewu:', margin, yPos);
      yPos += 5;
      doc.text(`Bank: ${data.seller.bankName}`, margin, yPos);
      yPos += 5;
      doc.text(`Nr konta: ${data.seller.bankAccount}`, margin, yPos);
      yPos += 10;
    }

    // Summary
    const summaryX = pageWidth - margin - 60;
    doc.text('Podsumowanie:', summaryX - 50, yPos);
    yPos += 5;
    [
      ['Wartość netto:', data.summary.totalNet],
      ['Wartość VAT:', data.summary.totalTax],
      ['Wartość brutto:', data.summary.totalGross]
    ].forEach(([label, value]) => {
      doc.text(label as string, summaryX - 50, yPos);
      doc.text(`${value.toFixed(2)} PLN`, summaryX, yPos);
      yPos += 5;
    });

    // Amount in words
    yPos += 5;
    doc.text('Słownie:', margin, yPos);
    yPos += 5;
    doc.text(numberToWords(data.summary.totalGross), margin, yPos);

    // Notes
    if (data.notes) {
      yPos += 10;
      doc.text('Uwagi:', margin, yPos);
      yPos += 5;
      doc.text(data.notes, margin, yPos);
    }

    // Signatures
    yPos = doc.internal.pageSize.getHeight() - 40;
    doc.text('..............................', margin, yPos);
    doc.text('..............................', pageWidth - margin - 40, yPos);
    yPos += 5;
    doc.text('Osoba upoważniona do odbioru', margin, yPos);
    doc.text('Osoba upoważniona do wystawienia', pageWidth - margin - 60, yPos);

    // Save the PDF
    doc.save(`Faktura_${data.number.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none">
      {/* Action buttons */}
      <div className="fixed top-4 right-4 z-10 flex space-x-4 print:hidden">
        <button 
          onClick={onBack} 
          className="btn-secondary"
          title="Powrót do listy"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do listy</span>
        </button>
        <button 
          onClick={handlePrint} 
          className="btn-secondary"
          title="Drukuj"
        >
          <Printer className="h-4 w-4" />
          <span>Drukuj</span>
        </button>
        <button 
          onClick={handleExportToPDF} 
          className="btn-primary"
          title="Eksportuj do PDF"
        >
          <FileText className="h-4 w-4" />
          <span>Eksportuj do PDF</span>
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {data.seller.logo && (
              <img 
                src={data.seller.logo} 
                alt={data.seller.name}
                className="h-16 w-auto mb-4"
              />
            )}
            <p className="text-sm">Data wystawienia: {data.issueDate}</p>
            <p className="text-sm">Data sprzedaży: {data.saleDate || data.issueDate}</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">FAKTURA VAT</h1>
            <p className="text-xl">Nr {data.number}</p>
          </div>
        </div>

        {/* Seller and Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-bold mb-2">Sprzedawca</h2>
            <div className="space-y-1">
              <p>{data.seller.name}</p>
              <p>{data.seller.address}</p>
              <p>{data.seller.postalCode} {data.seller.city}</p>
              <p>NIP: {data.seller.nip}</p>
              {data.seller.email && <p>E-mail: {data.seller.email}</p>}
              {data.seller.phone && <p>Tel: {data.seller.phone}</p>}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Nabywca</h2>
            <div className="space-y-1">
              <p>{data.buyer.name}</p>
              <p>{data.buyer.address}</p>
              <p>{data.buyer.postalCode} {data.buyer.city}</p>
              {data.buyer.nip && <p>NIP: {data.buyer.nip}</p>}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8">
          <p>
            Sposób płatności: {
              data.paymentMethod === 'transfer' ? 'Przelew' :
              data.paymentMethod === 'cash' ? 'Gotówka' : 'Karta'
            }
          </p>
          <p>Termin płatności: {data.dueDate}</p>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1E3A8A] text-white">
              <tr>
                <th className="px-4 py-2 text-left text-xs">LP</th>
                <th className="px-4 py-2 text-left text-xs">Nazwa towaru/usługi</th>
                <th className="px-4 py-2 text-right text-xs">Ilość</th>
                <th className="px-4 py-2 text-center text-xs">J.m.</th>
                <th className="px-4 py-2 text-right text-xs">Cena netto</th>
                <th className="px-4 py-2 text-right text-xs">Wartość netto</th>
                <th className="px-4 py-2 text-right text-xs">VAT %</th>
                <th className="px-4 py-2 text-right text-xs">Kwota VAT</th>
                <th className="px-4 py-2 text-right text-xs">Wartość brutto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item, index) => (
                <tr key={item.id} className="text-sm">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-center">{item.unit}</td>
                  <td className="px-4 py-2 text-right">{item.netPrice.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.netAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.taxRate}%</td>
                  <td className="px-4 py-2 text-right">{item.taxAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.grossAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bank Account Info */}
        {data.seller.bankAccount && (
          <div className="mb-8">
            <h3 className="font-bold mb-2">Dane do przelewu:</h3>
            <p>Bank: {data.seller.bankName}</p>
            <p className="font-mono">{data.seller.bankAccount}</p>
          </div>
        )}

        {/* Summary */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span>Wartość netto:</span>
                <span>{data.summary.totalNet.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Wartość VAT:</span>
                <span>{data.summary.totalTax.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>Wartość brutto:</span>
                <span>{data.summary.totalGross.toFixed(2)} PLN</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm">
              Słownie: {numberToWords(data.summary.totalGross)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mb-8">
            <h3 className="font-bold mb-2">Uwagi:</h3>
            <p className="text-sm">{data.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600">Osoba upoważniona do odbioru:</p>
            <div className="mt-16 border-t border-gray-300 pt-2 w-48">
              <p className="text-sm text-gray-500 text-center">Podpis</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Osoba upoważniona do wystawienia:</p>
            <p className="mt-2 font-medium">{data.issuer.name}</p>
            {data.issuer.position && (
              <p className="text-sm text-gray-600">{data.issuer.position}</p>
            )}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style type="text/css" media="print">{`
        @page { 
          size: A4;
          margin: 10mm;
        }
        body { 
          print-color-adjust: exact; 
          -webkit-print-color-adjust: exact;
        }
        .print\\:hidden {
          display: none !important;
        }
        img {
          max-width: none !important;
        }
      `}</style>
    </div>
  );
}