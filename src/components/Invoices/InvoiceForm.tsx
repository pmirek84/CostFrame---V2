import React, { useState, useEffect } from 'react';
import { FileText, Save, X, Plus, Trash2, Users2, Printer } from 'lucide-react';
import type { Client } from '../../types/client';
import InvoicePreview from './InvoicePreview';

interface InvoiceFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  net_price: number;
  tax_rate: number;
  net_amount: number;
  tax_amount: number;
  gross_amount: number;
}

function InvoiceForm({ onSubmit, onCancel, initialData }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || 'transfer');
  const [dueDays, setDueDays] = useState(14);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        setError(null);

        // Load clients from localStorage (CRM data source)
        const savedClients = localStorage.getItem('costframe_clients');
        if (!savedClients) {
          setClients([]);
          return;
        }

        const parsedClients = JSON.parse(savedClients);
        
        // Filter only active clients
        const activeClients = parsedClients.filter((client: Client) => 
          client.status === 'active'
        );

        setClients(activeClients);

        // If editing existing invoice, select the client
        if (initialData?.client_id) {
          const client = activeClients.find((c: Client) => c.id === initialData.client_id);
          if (client) {
            setSelectedClient(client);
          }
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        setError('Nie udało się załadować listy klientów');
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, [initialData]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FV/${year}${month}${day}/${random}`;
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unit: 'szt.',
      net_price: 0,
      tax_rate: 23,
      net_amount: 0,
      tax_amount: 0,
      gross_amount: 0
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;

      const updatedItem = { ...item, [field]: value };

      const net_amount = updatedItem.quantity * updatedItem.net_price;
      const tax_amount = (net_amount * updatedItem.tax_rate) / 100;
      const gross_amount = net_amount + tax_amount;

      return {
        ...updatedItem,
        net_amount,
        tax_amount,
        gross_amount
      };
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totals = items.reduce((acc, item) => ({
    net: acc.net + item.net_amount,
    tax: acc.tax + item.tax_amount,
    gross: acc.gross + item.gross_amount
  }), { net: 0, tax: 0, gross: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!selectedClient) {
        throw new Error('Wybierz klienta');
      }

      if (items.length === 0) {
        throw new Error('Dodaj przynajmniej jedną pozycję');
      }

      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const issueDate = new Date(formData.get('issue_date') as string);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + parseInt(dueDays.toString()));

      const invoiceData = {
        number: formData.get('number'),
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        payment_method: paymentMethod,
        items: items.map(item => ({
          ...item,
          net_price: parseFloat(item.net_price.toFixed(2)),
          net_amount: parseFloat(item.net_amount.toFixed(2)),
          tax_amount: parseFloat(item.tax_amount.toFixed(2)),
          gross_amount: parseFloat(item.gross_amount.toFixed(2))
        })),
        net_amount: totals.net,
        tax_amount: totals.tax,
        gross_amount: totals.gross,
        notes: formData.get('notes'),
        status: 'draft',
        client: {
          name: selectedClient.name,
          address: selectedClient.address,
          postal_code: selectedClient.postal_code,
          city: selectedClient.city,
          nip: selectedClient.nip
        }
      };

      await onSubmit(invoiceData);
      setSavedInvoice(invoiceData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania faktury');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPreview && savedInvoice) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-10 flex space-x-4">
          <button
            onClick={() => setShowPreview(false)}
            className="btn-secondary"
          >
            <X className="h-4 w-4" />
            <span>Zamknij podgląd</span>
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary"
          >
            <Printer className="h-4 w-4" />
            <span>Drukuj</span>
          </button>
        </div>
        <InvoicePreview data={savedInvoice} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">
              {initialData ? 'Edytuj fakturę' : 'Nowa faktura'}
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Numer faktury *
              </label>
              <input
                type="text"
                name="number"
                defaultValue={initialData?.number || generateInvoiceNumber()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data wystawienia *
              </label>
              <input
                type="date"
                name="issue_date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klient *
            </label>
            {isLoadingClients ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : clients.length > 0 ? (
              <div className="relative">
                <select
                  onChange={(e) => handleClientChange(e.target.value)}
                  value={selectedClient?.id || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Wybierz klienta</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.nip ? `(NIP: ${client.nip})` : ''}
                    </option>
                  ))}
                </select>
                <Users2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                <Users2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Brak aktywnych klientów</p>
                <p className="text-xs text-gray-500">
                  Dodaj klientów w module CRM aby móc wystawiać faktury
                </p>
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Dane klienta</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Adres:</p>
                  <p className="font-medium">
                    {selectedClient.address}
                    {selectedClient.postal_code || selectedClient.city ? (
                      <br />
                    ) : null}
                    {[selectedClient.postal_code, selectedClient.city]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">NIP:</p>
                  <p className="font-medium">{selectedClient.nip || 'Brak'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sposób płatności *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="transfer">Przelew</option>
                <option value="cash">Gotówka</option>
                <option value="card">Karta płatnicza</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Termin płatności (dni) *
              </label>
              <input
                type="number"
                value={dueDays}
                onChange={(e) => setDueDays(parseInt(e.target.value))}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pozycje faktury</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj pozycję</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-8 gap-4 items-start">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Nazwa"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="szt.">szt.</option>
                      <option value="godz.">godz.</option>
                      <option value="dni">dni</option>
                      <option value="m-c">m-c</option>
                      <option value="km">km</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.net_price}
                      onChange={(e) => handleItemChange(item.id, 'net_price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={item.tax_rate}
                      onChange={(e) => handleItemChange(item.id, 'tax_rate', parseInt(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="23">23%</option>
                      <option value="8">8%</option>
                      <option value="5">5%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.gross_amount.toFixed(2)}
                      className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Suma netto:</span>
                      <span>{totals.net.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Suma VAT:</span>
                      <span>{totals.tax.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Suma brutto:</span>
                      <span>{totals.gross.toFixed(2)} PLN</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Uwagi
            </label>
            <textarea
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span>Anuluj</span>
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Zapisywanie...' : 'Zapisz'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceForm;