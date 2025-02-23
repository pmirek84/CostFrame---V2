import React, { useState } from 'react';
import { Building2, Upload, Save, Plus, Trash2 } from 'lucide-react';

interface BankAccount {
  id: string;
  name: string;
  number: string;
}

interface CompanySettings {
  name: string;
  address: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  logo: string | null;
  preparedBy: string;
  bankAccounts: BankAccount[];
}

const initialSettings: CompanySettings = {
  name: 'STOK SP. Z O.O.',
  address: 'ul. Józefa Mireckiego 2, 75-506 Koszalin',
  taxId: '',
  email: 'keller@stok-handel.eu',
  phone: '+48 573 105 550',
  website: 'stok-handel.eu',
  logo: null,
  preparedBy: 'Jakub Keller',
  bankAccounts: []
};

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const savedSettings = localStorage.getItem('company_settings');
    return savedSettings ? JSON.parse(savedSettings) : initialSettings;
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(settings.logo);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBankAccount = () => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        { id: crypto.randomUUID(), name: '', number: '' }
      ]
    }));
  };

  const handleRemoveBankAccount = (id: string) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(account => account.id !== id)
    }));
  };

  const handleBankAccountChange = (id: string, field: keyof BankAccount, value: string) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(account =>
        account.id === id ? { ...account, [field]: value } : account
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Save in localStorage
      localStorage.setItem('company_settings', JSON.stringify({
        ...settings,
        logo: previewUrl
      }));

      // Show success message
      alert('Dane firmy zostały zapisane pomyślnie');
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień:', error);
      alert('Wystąpił błąd podczas zapisywania danych. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-xl font-semibold text-[#1E3A8A]">Dane firmy</h2>
          </div>
          <button 
            onClick={handleSubmit} 
            className="btn-primary"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
          </button>
        </div>

        <form className="space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo firmy
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-xs text-gray-400">
                      Wybierz plik
                    </span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo"
                  className="btn-secondary cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Wgraj logo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dane podstawowe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nazwa firmy
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIP
              </label>
              <input
                type="text"
                value={settings.taxId}
                onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Wprowadź NIP firmy"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Adres
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Strona www
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dokumenty przygotował(a)
              </label>
              <input
                type="text"
                value={settings.preparedBy}
                onChange={(e) => setSettings({ ...settings, preparedBy: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Konta bankowe */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Konta bankowe
              </label>
              <button
                type="button"
                onClick={handleAddBankAccount}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj konto</span>
              </button>
            </div>
            <div className="space-y-4">
              {settings.bankAccounts.map((account) => (
                <div key={account.id} className="flex items-start space-x-4">
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => handleBankAccountChange(account.id, 'name', e.target.value)}
                      placeholder="Nazwa banku"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      value={account.number}
                      onChange={(e) => handleBankAccountChange(account.id, 'number', e.target.value)}
                      placeholder="Numer konta"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBankAccount(account.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}