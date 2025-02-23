import React, { useState } from 'react';
import { Users2, Save, X } from 'lucide-react';
import type { Client } from '../../types/client';

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
}

export default function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set default type to avoid null access
  const [clientType, setClientType] = useState<'company' | 'individual'>(
    client?.type || 'company'
  );
  const [useSameAddress, setUseSameAddress] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      
      // Validate and type-check form data
      const name = formData.get('name') as string;
      const type = formData.get('type') as 'company' | 'individual';
      const status = formData.get('status') as 'active' | 'potential' | 'inactive';

      if (!name?.trim()) throw new Error('Nazwa jest wymagana');
      if (!type) throw new Error('Typ klienta jest wymagany');
      if (!status) throw new Error('Status jest wymagany');

      // Create data object with proper type safety
      const data: Partial<Client> = {
        name: name.trim(),
        type,
        status,
        // Contact info
        email: (formData.get('email') as string)?.trim() || null,
        phone: (formData.get('phone') as string)?.trim() || null,
        // Main address
        address: (formData.get('address') as string)?.trim() || null,
        postal_code: (formData.get('postal_code') as string)?.trim() || null,
        city: (formData.get('city') as string)?.trim() || null,
        // Billing address (if different)
        billing_address: !useSameAddress ? (formData.get('billing_address') as string)?.trim() || null : null,
        billing_postal_code: !useSameAddress ? (formData.get('billing_postal_code') as string)?.trim() || null : null,
        billing_city: !useSameAddress ? (formData.get('billing_city') as string)?.trim() || null : null,
        // Company data
        nip: type === 'company' ? (formData.get('nip') as string)?.trim() || null : null,
        regon: type === 'company' ? (formData.get('regon') as string)?.trim() || null : null,
        // Contact person
        contact_person: type === 'company' ? (formData.get('contact_person') as string)?.trim() || null : null,
        contact_position: type === 'company' ? (formData.get('contact_position') as string)?.trim() || null : null,
        contact_phone: type === 'company' ? (formData.get('contact_phone') as string)?.trim() || null : null,
        contact_email: type === 'company' ? (formData.get('contact_email') as string)?.trim() || null : null,
        // Notes
        notes: (formData.get('notes') as string)?.trim() || null
      };

      // If using same address, copy main address to billing address
      if (useSameAddress) {
        data.billing_address = data.address;
        data.billing_postal_code = data.postal_code;
        data.billing_city = data.city;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania danych klienta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">
              {client ? 'Edytuj klienta' : 'Nowy klient'}
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dane podstawowe</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Typ klienta *
                </label>
                <select
                  name="type"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value as 'company' | 'individual')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="company">Firma</option>
                  <option value="individual">Osoba prywatna</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {clientType === 'company' ? 'Nazwa firmy' : 'Imię i nazwisko'} *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={client?.name || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  name="status"
                  defaultValue={client?.status || 'potential'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="active">Aktywny</option>
                  <option value="potential">Potencjalny</option>
                  <option value="inactive">Nieaktywny</option>
                </select>
              </div>
            </div>
          </div>

          {/* Company Data */}
          {clientType === 'company' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dane firmowe</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NIP
                  </label>
                  <input
                    type="text"
                    name="nip"
                    defaultValue={client?.nip || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0000000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    REGON
                  </label>
                  <input
                    type="text"
                    name="regon"
                    defaultValue={client?.regon || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="000000000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dane kontaktowe</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email {clientType === 'company' && '*'}
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={client?.email || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required={clientType === 'company'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={client?.phone || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Main Address */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {clientType === 'company' ? 'Adres siedziby' : 'Adres zamieszkania'}
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ulica i numer
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={client?.address || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kod pocztowy
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    defaultValue={client?.postal_code || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Miejscowość
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={client?.city || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Adres do faktury</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {clientType === 'company' ? 'Taki sam jak adres siedziby' : 'Taki sam jak adres zamieszkania'}
                </span>
              </label>
            </div>

            {!useSameAddress && (
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ulica i numer
                  </label>
                  <input
                    type="text"
                    name="billing_address"
                    defaultValue={client?.billing_address || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kod pocztowy
                    </label>
                    <input
                      type="text"
                      name="billing_postal_code"
                      defaultValue={client?.billing_postal_code || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Miejscowość
                    </label>
                    <input
                      type="text"
                      name="billing_city"
                      defaultValue={client?.billing_city || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Person (for companies) */}
          {clientType === 'company' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Osoba kontaktowa</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imię i nazwisko *
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    defaultValue={client?.contact_person || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stanowisko
                  </label>
                  <input
                    type="text"
                    name="contact_position"
                    defaultValue={client?.contact_position || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    defaultValue={client?.contact_email || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    defaultValue={client?.contact_phone || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Uwagi
            </label>
            <textarea
              name="notes"
              defaultValue={client?.notes || ''}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
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