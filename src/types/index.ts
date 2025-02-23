import { z } from 'zod';

export interface Construction {
  id: string;
  number: number;
  name: string;
  type: string;
  width: number;
  height: number;
  quantity: number;
  area: number;
  totalArea: number;
  perimeter: number;
  totalPerimeter: number;
  installationLocation: 'wew' | 'zew';
  weight: number;
  materialCosts: {
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    total: number;
  };
  installationCosts: {
    rate: number;
    total: number;
  };
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface EmployeeCost {
  id: string;
  position: string;
  hourlyRate: number;
  monthlyRate: number;
  additionalCostsPercentage: number;
  totalMonthlyCost: number;
}

export interface LogisticsCost {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  category: string;
}

export interface RentalCost {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  category: string;
  minRentalPeriod: string;
  availability: string;
}

export interface WarrantyServiceCost {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  category: string;
}

export interface InternalCost {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  category: string;
  period?: string;
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