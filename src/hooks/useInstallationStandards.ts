import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface InstallationStandard {
  id: string;
  name: string;
  description: string;
  isPredefined: boolean;
  materials: InstallationMaterial[];
  labor: InstallationLabor;
  methods: InstallationMethod[];
}

export interface InstallationMaterial {
  id: string;
  name: string;
  quantityPerMeter: number;
  unit: string;
  unitPrice: number;
}

export interface InstallationLabor {
  id: string;
  hoursPerUnit: number;
  hourlyRate: number;
}

export interface InstallationMethod {
  id: string;
  name: string;
  description: string;
}

export function useInstallationStandards() {
  const [standards, setStandards] = useState<InstallationStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStandards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: standardsData, error: standardsError } = await supabase
        .from('installation_standards')
        .select('*')
        .order('name');

      if (standardsError) throw standardsError;

      const fullStandards = await Promise.all(
        standardsData.map(async (standard) => {
          const [
            { data: materials },
            { data: labor },
            { data: methods }
          ] = await Promise.all([
            supabase
              .from('installation_materials')
              .select('*')
              .eq('standard_id', standard.id),
            supabase
              .from('installation_labor')
              .select('*')
              .eq('standard_id', standard.id)
              .single(),
            supabase
              .from('installation_methods')
              .select('*')
              .eq('standard_id', standard.id)
          ]);

          return {
            id: standard.id,
            name: standard.name,
            description: standard.description,
            isPredefined: standard.is_predefined,
            materials: materials || [],
            labor: labor || { hoursPerUnit: 0, hourlyRate: 0 },
            methods: methods || []
          };
        })
      );

      setStandards(fullStandards);
    } catch (err) {
      console.error('Błąd podczas ładowania standardów montażu:', err);
      setError('Błąd podczas ładowania standardów montażu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandards();
  }, []);

  const calculateInstallationCosts = (
    standardId: string,
    perimeter: number,
    area: number
  ) => {
    const standard = standards.find(s => s.id === standardId);
    if (!standard) return null;

    const materialCosts = standard.materials.map(material => ({
      name: material.name,
      quantity: material.quantityPerMeter * perimeter,
      unitPrice: material.unitPrice,
      total: material.quantityPerMeter * perimeter * material.unitPrice
    }));

    const laborHours = standard.labor.hoursPerUnit * area;
    const laborCost = laborHours * standard.labor.hourlyRate;

    const totalMaterialCost = materialCosts.reduce((sum, item) => sum + item.total, 0);

    return {
      materials: materialCosts,
      labor: {
        hours: laborHours,
        rate: standard.labor.hourlyRate,
        total: laborCost
      },
      total: totalMaterialCost + laborCost
    };
  };

  return {
    standards,
    loading,
    error,
    calculateInstallationCosts,
    refresh: loadStandards
  };
}