export interface OfferSettings {
  workTime: {
    workTime: number;
    workerCount: number;
    hourlyRate: number;
  };
  margin: number;
  discount: number;
  installationRates: Record<string, {
    rate: number;
    unit: 'm²' | 'mb' | 'szt.';
  }>;
}