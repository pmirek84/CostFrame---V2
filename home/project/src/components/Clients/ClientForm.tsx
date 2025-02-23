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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Validate required fields
      const name = formData.get('name') as string;
      const type = formData.get('type') as 'company' | 'individual';
      const status = formData.get('status') as 'active' | 'potential' | 'inactive';

      if (!name?.trim()) throw new Error('Nazwa jest wymagana');
      if (!type) throw new Error('Typ klienta jest wymagany');
      if (!status) throw new Error('Status jest wymagany');
      
      const data = {
        name: name.trim(),
        type,
        status,
        email: (formData.get('email') as string)?.trim() || null,
        phone: (formData.get('phone') as string)?.trim() || null,
        address: (formData.get('address') as string)?.trim() || null,
        notes: (formData.get('notes') as string)?.trim() || null
      };

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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Typ klienta *
            </label>
            <select
              name="type"
              defaultValue={client?.type || 'company'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="company">Firma</option>
              <option value="individual">Osoba prywatna</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nazwa / Imię i nazwisko *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={client?.name}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={client?.email || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={client?.phone || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adres
            </label>
            <textarea
              name="address"
              defaultValue={client?.address || ''}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

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