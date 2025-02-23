import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

interface OfferNote {
  id: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const noteCategories = [
  'Przygotowanie przed montażem',
  'Wymogi techniczne podczas montażu',
  'Montaż elementów elektrycznych',
  'Uwagi dotyczące szyb',
  'Montaż okuć i elementów mechanicznych',
  'Montaż konstrukcji aluminiowych',
  'Kontrola po montażu',
  'Wymogi dotyczące transportu',
  'Zalecenia dla montażu w miejscach użyteczności publicznej'
];

const initialNotes: OfferNote[] = [
  {
    id: '1',
    category: 'Przygotowanie przed montażem',
    content: 'Sprawdzić wymiary otworów montażowych i porównać z wymiarami konstrukcji. Otwory powinny być oczyszczone z gruzu i pozostałości po pracach budowlanych.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    category: 'Wymogi techniczne podczas montażu',
    content: 'Zachować odpowiednie szczeliny dylatacyjne: góra 15-20mm, boki 10-15mm, dół 15-30mm. Stosować kliny dystansowe do poziomowania i pionowania konstrukcji.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function OfferNotes() {
  const [notes, setNotes] = useState<OfferNote[]>(initialNotes);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddNote = (category: string) => {
    const newNote: OfferNote = {
      id: crypto.randomUUID(),
      category,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    setEditingNote(newNote.id);
    setEditedContent('');
  };

  const handleEditNote = (note: OfferNote) => {
    setEditingNote(note.id);
    setEditedContent(note.content);
  };

  const handleSaveNote = (noteId: string) => {
    if (editedContent.trim()) {
      setNotes(notes.map(note =>
        note.id === noteId
          ? {
              ...note,
              content: editedContent.trim(),
              updatedAt: new Date().toISOString()
            }
          : note
      ));
    }
    setEditingNote(null);
    setEditedContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę uwagę?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="h-6 w-6 text-[#1E3A8A]" />
        <h2 className="text-xl font-semibold text-[#1E3A8A]">Uwagi montażowe</h2>
      </div>

      <div className="space-y-4">
        {noteCategories.map(category => {
          const categoryNotes = notes.filter(note => note.category === category);
          const isExpanded = expandedCategories.includes(category);

          return (
            <div key={category} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{category}</span>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  {categoryNotes.map(note => (
                    <div key={note.id} className="relative group">
                      {editingNote === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Wpisz treść uwagi..."
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingNote(null)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSaveNote(note.id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">{note.content}</p>
                          <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddNote(category)}
                    className="w-full py-2 flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Dodaj uwagę</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}