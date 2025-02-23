import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Download } from 'lucide-react';

interface ImportSectionProps {
  title: string;
  onImport: (data: any) => void;
  templateFields: string[];
}

type ImportStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function ImportSection({ title, onImport, templateFields }: ImportSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'text/csv') {
        setSelectedFile(file);
        setImportStatus('idle');
        setErrorMessage('');
      } else {
        setErrorMessage('Dozwolone formaty plików: .xlsx, .xls, .csv');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportStatus('uploading');
    
    // Symulacja importu
    setTimeout(() => {
      setImportStatus('success');
      // Tu dodać właściwą logikę importu
      onImport({});
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    // Tu dodać logikę generowania i pobierania szablonu
    console.log('Pobieranie szablonu:', templateFields);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Import danych - {title}</h3>
        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary"
        >
          <Download className="h-4 w-4" />
          <span>Pobierz szablon</span>
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <FileSpreadsheet className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Przeciągnij i upuść plik lub kliknij poniżej aby wybrać
            </p>
            <p className="text-xs text-gray-400">
              Obsługiwane formaty: .xlsx, .xls, .csv
            </p>
          </div>
          
          <label className="btn-primary cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
            />
            <Upload className="h-4 w-4" />
            <span>Wybierz plik</span>
          </label>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleImport}
                disabled={importStatus === 'uploading'}
                className="btn-primary"
              >
                {importStatus === 'uploading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Importowanie...</span>
                  </>
                ) : importStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Zaimportowano</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Importuj</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}