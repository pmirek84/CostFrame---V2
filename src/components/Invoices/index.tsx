import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Search, ArrowUpDown, Edit2, Trash2, Eye, Printer } from 'lucide-react';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';

interface Invoice {
  id: string;
  number: string;
  client_id: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  payment_method: 'transfer' | 'cash' | 'card';
  net_amount: number;
  tax_amount: number;
  gross_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'costframe_invoices';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'number' | 'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const companySettings = (() => {
    try {
      const settings = localStorage.getItem('company_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading company settings:', error);
      return null;
    }
  })();

  useEffect(() => {
    const loadInvoices = () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedInvoices = localStorage.getItem(STORAGE_KEY);
        if (savedInvoices) {
          setInvoices(JSON.parse(savedInvoices));
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        setError('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  useEffect(() => {
    const checkOverdueInvoices = () => {
      const today = new Date();
      const updatedInvoices = invoices.map(invoice => {
        if (invoice.status === 'sent' && new Date(invoice.due_date) < today) {
          return { ...invoice, status: 'overdue' as const };
        }
        return invoice;
      });

      if (JSON.stringify(updatedInvoices) !== JSON.stringify(invoices)) {
        setInvoices(updatedInvoices);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      }
    };

    checkOverdueInvoices();
    const interval = setInterval(checkOverdueInvoices, 3600000);

    return () => clearInterval(interval);
  }, [invoices]);

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    if (!invoice) return;

    const previewData = {
      number: invoice.number,
      issueDate: new Date(invoice.issue_date).toLocaleDateString('pl-PL'),
      saleDate: new Date(invoice.issue_date).toLocaleDateString('pl-PL'),
      dueDate: new Date(invoice.due_date).toLocaleDateString('pl-PL'),
      paymentMethod: invoice.payment_method,
      paymentStatus: invoice.status === 'paid' ? 'paid' as const :
                    invoice.status === 'overdue' ? 'unpaid' as const :
                    'unpaid' as const,
      seller: {
        name: companySettings?.name || 'STOK SP. Z O.O.',
        address: companySettings?.address || 'ul. Józefa Mireckiego 2',
        postalCode: '75-506',
        city: 'Koszalin',
        nip: companySettings?.taxId || '',
        email: companySettings?.email || 'keller@stok-handel.eu',
        phone: companySettings?.phone || '+48 573 105 550',
        bankName: companySettings?.bankAccounts?.[0]?.name || '',
        bankAccount: companySettings?.bankAccounts?.[0]?.number || '',
        logo: companySettings?.logo || undefined
      },
      buyer: {
        name: invoice.client_name || '',
        address: 'Adres klienta',
        postalCode: '00-000',
        city: 'Miasto',
        nip: ''
      },
      items: [{
        id: '1',
        name: 'Pozycja 1',
        quantity: 1,
        unit: 'szt.',
        netPrice: invoice.net_amount || 0,
        taxRate: 23,
        netAmount: invoice.net_amount || 0,
        taxAmount: invoice.tax_amount || 0,
        grossAmount: invoice.gross_amount || 0
      }],
      summary: {
        totalNet: invoice.net_amount || 0,
        totalTax: invoice.tax_amount || 0,
        totalGross: invoice.gross_amount || 0,
      },
      notes: invoice.notes || '',
      issuer: {
        name: companySettings?.preparedBy || 'Jakub Keller',
        position: 'Specjalista ds. sprzedaży'
      }
    };

    setPreviewInvoice(previewData);
  };

  const handlePrint = (invoice: Invoice) => {
    handlePreviewInvoice(invoice);
  };

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      setError(null);
      const updatedInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const updates = {
            ...invoice,
            status: newStatus,
            updated_at: new Date().toISOString()
          };

          if (newStatus === 'paid') {
            updates.payment_date = new Date().toISOString();
          } else {
            updates.payment_date = undefined;
          }

          return updates;
        }
        return invoice;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setError('Failed to update invoice status');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      const timestamp = new Date().toISOString();
      
      if (editingInvoice) {
        const updatedInvoices = invoices.map(invoice => 
          invoice.id === editingInvoice.id 
            ? { ...invoice, ...data, updated_at: timestamp }
            : invoice
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
        setInvoices(updatedInvoices);
      } else {
        const newInvoice = {
          id: crypto.randomUUID(),
          ...data,
          created_at: timestamp,
          updated_at: timestamp
        };
        const updatedInvoices = [...invoices, newInvoice];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
        setInvoices(updatedInvoices);
      }
      
      setIsFormOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      setError(null);
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingInvoice(null);
    setPreviewInvoice(null);
  };

  const handleSort = (key: 'number' | 'date' | 'amount') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const getStatusBadgeClass = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
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

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === 'number') {
      return sortOrder === 'asc'
        ? a.number.localeCompare(b.number)
        : b.number.localeCompare(a.number);
    } else if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
        : new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
    } else {
      return sortOrder === 'asc'
        ? a.gross_amount - b.gross_amount
        : b.gross_amount - a.gross_amount;
    }
  });

  if (isFormOpen) {
    return (
      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={editingInvoice}
      />
    );
  }

  if (previewInvoice) {
    return (
      <InvoicePreview
        data={previewInvoice}
        onBack={handleCancel}
      />
    );
  }

  const totalAmount = sortedInvoices.reduce((sum, invoice) => sum + invoice.gross_amount, 0);
  const unpaidAmount = sortedInvoices
    .filter(invoice => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.gross_amount, 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Faktury</h2>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              <span>Eksportuj</span>
            </button>
            <button onClick={handleAddInvoice} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Nowa faktura</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Liczba faktur</div>
            <div className="text-2xl font-semibold text-gray-900">{invoices.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Suma brutto</div>
            <div className="text-2xl font-semibold text-[#1E3A8A]">
              {totalAmount.toFixed(2)} PLN
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Do zapłaty</div>
            <div className="text-2xl font-semibold text-red-600">
              {unpaidAmount.toFixed(2)} PLN
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Zaległe faktury</div>
            <div className="text-2xl font-semibold text-gray-900">
              {invoices.filter(i => i.status === 'overdue').length}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Szukaj po numerze lub kliencie..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button onClick={() => handleSort('number')} className="btn-secondary">
            <span>Numer</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('date')} className="btn-secondary">
            <span>Data</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleSort('amount')} className="btn-secondary">
            <span>Kwota</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto"></div>
          <p className="mt-4 text-gray-500">Ładowanie faktur...</p>
        </div>
      ) : sortedInvoices.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klient
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issue_date).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}
                      >
                        <option value="draft">Szkic</option>
                        <option value="sent">Wysłana</option>
                        <option value="paid">Opłacona</option>
                        <option value="overdue">Zaległa</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-[#1E3A8A]">
                      {invoice.gross_amount.toFixed(2)} PLN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Podgląd"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrint(invoice)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Drukuj"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Edytuj"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak faktur
          </h3>
          <p className="mb-4">
            Dodaj swoją pierwszą fakturę, aby rozpocząć zarządzanie dokumentami
          </p>
        </div>
      )}
    </div>
  );
}