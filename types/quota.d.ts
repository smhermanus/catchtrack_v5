// Types for Quota Management
export interface Quota {
  id: string;
  name: string;
  description?: string;
  limit: number;
  used: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type: 'hard' | 'soft';
  resourceType: string;
  startDate?: Date;
  endDate?: Date;
}

export interface QuotaWithRelations extends Quota {
  userId?: string;
  organizationId?: string;
  projectId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface QuotaUsage {
  quotaId: string;
  currentUsage: number;
  percentageUsed: number;
  isExceeded: boolean;
  projectedExceedance?: Date;
}

export interface QuotaAllocation {
  quotaId: string;
  resourceId: string;
  allocatedAmount: number;
  remainingAmount: number;
}

export interface QuotaAdjustment {
  quotaId: string;
  adjustmentAmount: number;
  reason: string;
  timestamp: Date;
  approvedBy?: string;
}

export type QuotaStatus = 'active' | 'exhausted' | 'warning' | 'disabled';

export interface QuotaTracking {
  getQuota(id: string): Promise<QuotaWithRelations>;
  updateQuota(id: string, updates: Partial<Quota>): Promise<QuotaWithRelations>;
  checkQuotaUsage(id: string): Promise<QuotaUsage>;
  allocateQuota(quotaId: string, resourceId: string, amount: number): Promise<QuotaAllocation>;
  adjustQuota(adjustment: QuotaAdjustment): Promise<QuotaWithRelations>;
}
