import { z } from 'zod';

export interface CostItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  manufacturer: string;
  constructionTypes: string[];
  unit: string;
  suggestedUsage: string;
  application: string;
  unitPrice: number;
}

// Construction schema for validation
export const constructionSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  type: z.string().min(1, "Typ jest wymagany"),
  width: z.number().min(1, "Szerokość musi być większa niż 0"),
  height: z.number().min(1, "Wysokość musi być większa niż 0"),
  quantity: z.number().min(1, "Ilość musi być większa niż 0"),
  installationLocation: z.string().min(1, "Lokalizacja montażu jest wymagana"),
  weight: z.number().min(0, "Waga nie może być ujemna")
});

// Rest of the types remain the same...
export interface ConstructionStandard {
  id: string;
  type: string;
  mountingLocation: string;
}

export interface MountingMaterial {
  id: string;
  category: string;
  manufacturer: string;
  name: string;
  constructionTypes: string[];
  unit: string;
  suggestedUsage: string;
  application: string;
  unitPrice: number;
}

export interface ConstructionItem {
  id: string;
  number: string;
  name: string;
  type: string;
  width: number;
  height: number;
  quantity: number;
  area: number;
  totalArea: number;
  perimeter: number;
  totalPerimeter: number;
  location: 'wew' | 'zew';
  weight: number;
  mountingStandard?: string;
  mountingMaterials: {
    left: MountingMaterial[];
    right: MountingMaterial[];
    top: MountingMaterial[];
    bottom: MountingMaterial[];
  };
  mountingRate: {
    rate: number;
    unit: 'm²' | 'mb' | 'szt';
  };
}