import React from 'react';
import { FileText, Users, MapPin } from 'lucide-react';

interface InitialOfferFormProps {
  onSubmit: (data: { number: string; client: string; location: string }) => void;
  onCancel: () => void;
}

export default function InitialOfferForm({ onSubmit, onCancel }: InitialOfferFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      number: formData.get('number') as string,
      client: formData.get('client') as string,
      location: formData.get('location') as string
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-[#1E3A8A]" />
          <h2 className="text-xl font-semibold text-[#1E3A8A]">Nowa oferta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Numer oferty */}
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700">
              Numer oferty
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="number"
                id="number"
                required
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="np. OF/2024/001"
              />
            </div>
          </div>

          {/* Klient */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700">
              Klient
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="client"
                id="client"
                required
                className="w-full pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nazwa klienta"
              />
            </div>
          </div>

          {/* Lokalizacja */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Miejsce wbudowania
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="location"
                id="location"
                required
                className="w-full pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Adres montażu"
              />
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Dalej
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}