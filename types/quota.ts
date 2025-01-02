// Type definitions for Quota-related entities

export interface QuotaWithRelations {
  id: string;
  speciesId: string;
  vesselId?: string;
  startDate: Date;
  endDate: Date;
  initialAmount: number;
  remainingAmount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';

  // Optional relations
  species?: {
    id: string;
    name: string;
    scientificName?: string;
  };

  vessel?: {
    id: string;
    name: string;
    registrationNumber?: string;
  };
}

// Additional types can be added as needed
export type QuotaStatus = QuotaWithRelations['status'];
