import React, { useState, useEffect } from 'react';
import { Users2, ArrowLeft, Edit2, Trash2, FileText, Receipt } from 'lucide-react';
import type { Client } from '../../types/client';

interface Invoice {
  id: string;
  number: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  net_amount: number;
  tax_amount: number;
  gross_amount: number;
  payment_method: 'transfer' | 'cash' | 'card';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ClientDetailsProps {
  client: Client | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClientDetails({ client, onBack, onEdit, onDelete }: ClientDetailsProps) {
  const [activeView, setActiveView] = useState<'details' | 'offers' | 'invoices'>('details');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  useEffect(() => {
    const loadInvoices = () => {
      try {
        setIsLoadingInvoices(true);
        const savedInvoices = localStorage.getItem('costframe_invoices');
        if (savedInvoices && client) {
          const allInvoices: Invoice[] = JSON.parse(savedInvoices);
          const clientInvoices = allInvoices.filter(invoice => invoice.client_id === client.id);
          setInvoices(clientInvoices);
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, [client]);

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nie znaleziono danych klienta</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'potential':
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Opłacona';
      case 'sent':
        return 'Wysłana';
      case 'overdue':
        return 'Zaległa';
      default:
        return 'Szkic';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <Users2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">{client.name}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'details'
                  ? 'border-[#1E3A8A] text-[#1E3A8A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dane podstawowe
            </button>
            <button
              onClick={() => setActiveView('offers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'offers'
                  ? 'border-[#1E3A8A] text-[#1E3A8A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Oferty
            </button>
            <button
              onClick={() => setActiveView('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'invoices'
                  ? 'border-[#1E3A8A] text-[#1E3A8A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Faktury
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeView === 'details' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dane podstawowe</h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Typ klienta:</span>
                  <p className="font-medium text-gray-900">
                    {client.type === 'company' ? 'Firma' : 'Osoba prywatna'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusBadgeClass(client.status)
                    }`}>
                      {client.status === 'active' ? 'Aktywny'
                        : client.status === 'potential' ? 'Potencjalny'
                        : 'Nieaktywny'}
                    </span>
                  </p>
                </div>

                {client.type === 'company' && (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">NIP:</span>
                      <p className="font-medium text-gray-900">{client.nip || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">REGON:</span>
                      <p className="font-medium text-gray-900">{client.regon || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dane kontaktowe</h3>
              
              <div className="space-y-2">
                {client.email && (
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{client.email}</p>
                  </div>
                )}
                
                {client.phone && (
                  <div>
                    <span className="text-sm text-gray-500">Telefon:</span>
                    <p className="font-medium text-gray-900">{client.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {client.type === 'company' ? 'Adres siedziby' : 'Adres zamieszkania'}
              </h3>
              
              <div className="space-y-2">
                {client.address && (
                  <div>
                    <span className="text-sm text-gray-500">Adres:</span>
                    <p className="font-medium text-gray-900">{client.address}</p>
                  </div>
                )}
                {(client.postal_code || client.city) && (
                  <div>
                    <span className="text-sm text-gray-500">Kod pocztowy i miasto:</span>
                    <p className="font-medium text-gray-900">
                      {[client.postal_code, client.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Adres do faktury</h3>
              
              <div className="space-y-2">
                {client.billing_address && (
                  <div>
                    <span className="text-sm text-gray-500">Adres:</span>
                    <p className="font-medium text-gray-900">{client.billing_address}</p>
                  </div>
                )}
                {(client.billing_postal_code || client.billing_city) && (
                  <div>
                    <span className="text-sm text-gray-500">Kod pocztowy i miasto:</span>
                    <p className="font-medium text-gray-900">
                      {[client.billing_postal_code, client.billing_city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            {client.type === 'company' && (client.contact_person || client.contact_position || client.contact_email || client.contact_phone) && (
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Osoba kontaktowa</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {client.contact_person && (
                    <div>
                      <span className="text-sm text-gray-500">Imię i nazwisko:</span>
                      <p className="font-medium text-gray-900">{client.contact_person}</p>
                    </div>
                  )}
                  
                  {client.contact_position && (
                    <div>
                      <span className="text-sm text-gray-500">Stanowisko:</span>
                      <p className="font-medium text-gray-900">{client.contact_position}</p>
                    </div>
                  )}
                  
                  {client.contact_email && (
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900">{client.contact_email}</p>
                    </div>
                  )}
                  
                  {client.contact_phone && (
                    <div>
                      <span className="text-sm text-gray-500">Telefon:</span>
                      <p className="font-medium text-gray-900">{client.contact_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeView === 'offers' ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak ofert
            </h3>
            <p>Nie przygotowano jeszcze żadnych ofert dla tego klienta</p>
          </div>
        ) : (
          <div>
            {isLoadingInvoices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto"></div>
                <p className="mt-4 text-gray-500">Ładowanie faktur...</p>
              </div>
            ) : invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data wystawienia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Termin płatności
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kwota brutto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.issue_date).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.due_date).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-[#1E3A8A]">
                          {invoice.gross_amount.toFixed(2)} PLN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak faktur
                </h3>
                <p>Nie wystawiono jeszcze żadnych faktur dla tego klienta</p>
              </div>
            )}
          </div>
        )}

        {client.notes && activeView === 'details' && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Uwagi</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}