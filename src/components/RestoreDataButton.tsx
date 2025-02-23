import React, { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface RestoreDataButtonProps {
  onRestore: () => void;
  label?: string;
}

export default function RestoreDataButton({ onRestore, label = 'Przywróć dane' }: RestoreDataButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restored, setRestored] = useState(false);

  const handleRestore = async () => {
    if (confirm('Czy na pewno chcesz przywrócić dane? Ta operacja nadpisze obecne dane.')) {
      setIsRestoring(true);
      
      try {
        await onRestore();
        setRestored(true);
        setTimeout(() => setRestored(false), 2000);
      } catch (error) {
        console.error('Błąd podczas przywracania danych:', error);
      }
      
      setIsRestoring(false);
    }
  };

  return (
    <button
      onClick={handleRestore}
      disabled={isRestoring}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        restored
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      {isRestoring ? (
        <RotateCcw className="h-4 w-4 animate-spin" />
      ) : restored ? (
        <Check className="h-4 w-4" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      <span>{restored ? 'Przywrócono' : label}</span>
    </button>
  );
}