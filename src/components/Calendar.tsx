import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Plus, X, Save } from 'lucide-react';
import { useCalendar, type CalendarEvent } from '../contexts/CalendarContext';
import EventForm from './Calendar/EventForm';

export default function Calendar() {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarEvent>>({});
  const [filter, setFilter] = useState<'All' | 'Oferta' | 'Zlecenie' | 'Spotkanie' | 'Montaż' | 'Inne'>('All');
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    setShowEventForm(true);
  };

  const handleNewEventClick = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowEventForm(true);
  };

  const handleEventClick = (info: { event: any }) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setEditForm({
        ...event,
        start: event.start,
        end: event.end || event.start
      });
    }
  };

  const handleStartEdit = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent);
      setEditForm({
        ...selectedEvent,
        start: selectedEvent.start,
        end: selectedEvent.end || selectedEvent.start
      });
      setError(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingEvent || !editForm.title || !editForm.start) {
      setError('Brakuje wymaganych pól');
      return;
    }

    try {
      const updatedEvent: CalendarEvent = {
        ...editingEvent,
        ...editForm,
        id: editingEvent.id,
        type: editForm.type || editingEvent.type,
        start: editForm.start,
        end: editForm.end || editForm.start
      };

      await updateEvent(updatedEvent);
      setEditingEvent(null);
      setEditForm({});
      setSelectedEvent(null);
      setError(null);
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error instanceof Error ? error.message : 'Nie udało się zaktualizować wydarzenia');
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      deleteEvent(selectedEvent.id);
      setSelectedEvent(null);
      setEditingEvent(null);
      setEditForm({});
    }
  };

  const filteredEvents = filter === 'All' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Kalendarz</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as typeof view)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            >
              <option value="dayGridMonth">Miesiąc</option>
              <option value="timeGridWeek">Tydzień</option>
              <option value="timeGridDay">Dzień</option>
            </select>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            >
              <option value="All">Wszystko</option>
              <option value="Oferta">Oferty</option>
              <option value="Zlecenie">Zlecenia</option>
              <option value="Spotkanie">Spotkania</option>
              <option value="Montaż">Montaże</option>
              <option value="Inne">Inne</option>
            </select>

            <button onClick={handleNewEventClick} className="btn-primary">
              <Plus className="h-4 w-4" />
              <span>Nowe wydarzenie</span>
            </button>
          </div>
        </div>

        <div className="calendar-container min-h-[500px] h-[calc(100vh-16rem)]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
              }
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={filteredEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable
            selectable
            selectMirror
            dayMaxEvents={true}
            weekends
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            locale="pl"
            height="100%"
            expandRows={true}
            stickyHeaderDates={true}
            handleWindowResize={true}
            buttonText={{
              today: 'Dziś',
              month: 'Miesiąc',
              week: 'Tydzień',
              day: 'Dzień'
            }}
            eventClassNames={(arg) => {
              const event = events.find(e => e.id === arg.event.id);
              return [
                'cursor-pointer transition-opacity',
                event?.status === 'completed' ? 'opacity-50' : '',
                event?.type === 'Oferta' ? 'bg-[#1E3A8A] border-[#1E3A8A]' :
                event?.type === 'Zlecenie' ? 'bg-[#27AE60] border-[#27AE60]' :
                event?.type === 'Spotkanie' ? 'bg-[#F1C40F] border-[#F1C40F] text-gray-900' :
                event?.type === 'Montaż' ? 'bg-[#8E44AD] border-[#8E44AD]' :
                'bg-[#95A5A6] border-[#95A5A6]'
              ];
            }}
          />
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4">
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {editingEvent ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tytuł"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Data</label>
                      <input
                        type="date"
                        value={new Date(editForm.start || '').toISOString().split('T')[0]}
                        onChange={(e) => {
                          const date = e.target.value;
                          const currentStart = new Date(editForm.start || '');
                          const currentEnd = new Date(editForm.end || editForm.start || '');
                          
                          const newStart = new Date(date);
                          newStart.setHours(currentStart.getHours(), currentStart.getMinutes());
                          
                          const newEnd = new Date(date);
                          newEnd.setHours(currentEnd.getHours(), currentEnd.getMinutes());
                          
                          setEditForm({
                            ...editForm,
                            start: newStart.toISOString(),
                            end: newEnd.toISOString()
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Godzina</label>
                      <input
                        type="time"
                        value={new Date(editForm.start || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        onChange={(e) => {
                          const time = e.target.value;
                          const [hours, minutes] = time.split(':');
                          const currentStart = new Date(editForm.start || '');
                          currentStart.setHours(parseInt(hours), parseInt(minutes));
                          
                          const currentEnd = new Date(currentStart);
                          currentEnd.setHours(currentStart.getHours() + 1);
                          
                          setEditForm({
                            ...editForm,
                            start: currentStart.toISOString(),
                            end: currentEnd.toISOString()
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editForm.client || ''}
                    onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Klient"
                  />
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Lokalizacja"
                  />
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Opis"
                    rows={2}
                  />
                  <div className="flex space-x-4">
                    <select
                      value={editForm.status || 'planned'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CalendarEvent['status'] })}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planned">Zaplanowane</option>
                      <option value="in-progress">W trakcie</option>
                      <option value="completed">Zakończone</option>
                      <option value="cancelled">Anulowane</option>
                    </select>
                    <select
                      value={editForm.priority || 'normal'}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as CalendarEvent['priority'] })}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Niski</option>
                      <option value="normal">Normalny</option>
                      <option value="high">Wysoki</option>
                      <option value="urgent">Pilny</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                      <p className="text-sm text-gray-500">{selectedEvent.type}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Start:</span>{' '}
                      {new Date(selectedEvent.start).toLocaleString('pl-PL')}
                    </p>
                    {selectedEvent.end && (
                      <p className="text-sm">
                        <span className="font-medium">Koniec:</span>{' '}
                        {new Date(selectedEvent.end).toLocaleString('pl-PL')}
                      </p>
                    )}
                    {selectedEvent.client && (
                      <p className="text-sm">
                        <span className="font-medium">Klient:</span> {selectedEvent.client}
                      </p>
                    )}
                    {selectedEvent.location && (
                      <p className="text-sm">
                        <span className="font-medium">Miejsce:</span> {selectedEvent.location}
                      </p>
                    )}
                    {selectedEvent.description && (
                      <p className="text-sm">
                        <span className="font-medium">Opis:</span> {selectedEvent.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full ${
                      selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedEvent.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEvent.status === 'completed' ? 'Zakończone' :
                       selectedEvent.status === 'in-progress' ? 'W trakcie' :
                       selectedEvent.status === 'cancelled' ? 'Anulowane' :
                       'Zaplanowane'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                {editingEvent ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      Zapisz
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDeleteEvent}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      Usuń
                    </button>
                    <button
                      onClick={handleStartEdit}
                      className="btn-primary"
                    >
                      Edytuj
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventForm && selectedDate && (
        <EventForm
          date={selectedDate}
          onSubmit={addEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
}