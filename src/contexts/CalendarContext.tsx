import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Oferta' | 'Zlecenie' | 'Spotkanie' | 'Montaż' | 'Inne';
  start: string;
  end?: string;
  description?: string;
  location?: string;
  client?: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface CalendarContextType {
  events: CalendarEvent[];
  error: string | null;
  isLoading: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

const STORAGE_KEY = 'calendar_events';

// Add some sample events for testing
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Spotkanie z klientem',
    type: 'Spotkanie',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    client: 'Jan Kowalski',
    location: 'Biuro',
    status: 'planned',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Montaż okien',
    type: 'Montaż',
    start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    client: 'Anna Nowak',
    location: 'ul. Kwiatowa 15',
    status: 'planned',
    priority: 'normal'
  },
  {
    id: '3',
    title: 'Przygotowanie oferty',
    type: 'Oferta',
    start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    client: 'Firma XYZ',
    status: 'planned',
    priority: 'urgent'
  }
];

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const storedEvents = localStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        // If no events exist, initialize with sample events
        setEvents(sampleEvents);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Nie udało się załadować wydarzeń');
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      setError(null);

      const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID()
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (err) {
      console.error('Error adding event:', err);
      throw err instanceof Error ? err : new Error('Wystąpił błąd podczas dodawania wydarzenia');
    }
  };

  const updateEvent = async (event: CalendarEvent) => {
    try {
      setError(null);

      const updatedEvents = events.map(e => 
        e.id === event.id ? event : e
      );
      setEvents(updatedEvents);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (err) {
      console.error('Error updating event:', err);
      throw err instanceof Error ? err : new Error('Wystąpił błąd podczas aktualizacji wydarzenia');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setError(null);

      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err instanceof Error ? err : new Error('Wystąpił błąd podczas usuwania wydarzenia');
    }
  };

  return (
    <CalendarContext.Provider value={{ 
      events, 
      error, 
      isLoading,
      addEvent, 
      updateEvent, 
      deleteEvent,
      refreshEvents: loadEvents
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}