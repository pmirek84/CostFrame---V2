import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { CalendarEvent } from '../../contexts/CalendarContext';
import { supabase } from '../../lib/supabaseClient';

interface EventFormProps {
  date: string;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onClose: () => void;
}

interface Client {
  id: string;
  name: string;
}

export default function EventForm({ date, onSubmit, onClose }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Spotkanie' as CalendarEvent['type'],
    date: date,
    startTime: '09:00',
    endTime: '10:00',
    client: '',
    location: '',
    description: '',
    priority: 'normal' as CalendarEvent['priority']
  });

  // Load clients list
  useEffect(() => {
    const loadClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Error loading clients:', err);
      }
    };

    loadClients();
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Tytuł jest wymagany');
    }
    if (!formData.type) {
      throw new Error('Typ wydarzenia jest wymagany');
    }
    if (!formData.date) {
      throw new Error('Data jest wymagana');
    }
    if (!formData.startTime) {
      throw new Error('Godzina rozpoczęcia jest wymagana');
    }
    if (!formData.endTime) {
      throw new Error('Godzina zakończenia jest wymagana');
    }

    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);

    if (isNaN(start.getTime())) {
      throw new Error('Nieprawidłowa data rozpoczęcia');
    }
    if (isNaN(end.getTime())) {
      throw new Error('Nieprawidłowa data zakończenia');
    }
    if (end <= start) {
      throw new Error('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setError(null);
      setIsSubmitting(true);
      
      validateForm();

      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Nieprawidłowy format daty lub godziny');
      }

      const eventData = {
        title: formData.title.trim(),
        type: formData.type,
        start: start.toISOString(),
        end: end.toISOString(),
        client: formData.client || undefined,
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: 'planned' as const,
        priority: formData.priority
      };

      await onSubmit(eventData);
      onClose();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Wystąpił nieoczekiwany błąd podczas tworzenia wydarzenia'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Nowe wydarzenie</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tytuł *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Typ wydarzenia *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="Spotkanie">Spotkanie</option>
              <option value="Oferta">Oferta</option>
              <option value="Zlecenie">Zlecenie</option>
              <option value="Montaż">Montaż</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Klient
            </label>
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Wybierz klienta</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Godzina rozpoczęcia *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Godzina zakończenia *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Miejsce
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priorytet *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as CalendarEvent['priority'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="low">Niski</option>
              <option value="normal">Normalny</option>
              <option value="high">Wysoki</option>
              <option value="urgent">Pilny</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Opis
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2 inline" />
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}