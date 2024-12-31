import { Quota, QuotaAlert, QuotaTransfer, ComplianceRecord, CatchRecord, TransferStatus } from "@prisma/client";

export interface QuotaWithRelations extends Quota {
  species: {
    species: {
      id: number;
      commonName: string;
      scientificName: string;
    };
    catchLimit: number | null;
    minimumSize: number | null;
    maximumSize: number | null;
  }[];
  landingSites: {
    landingSite: {
      id: number;
      siteName: string;
      zone: string;
    };
  }[];
  rightsholders: {
    rightsholder: {
      id: number;
      companyName: string;
      rightsholderCode: string;
    };
  }[];
  alerts: QuotaAlert[];
}

export interface ComplianceWithRelations extends ComplianceRecord {
  reporter: {
    firstName: string;
    lastName: string;
  };
  resolver?: {
    firstName: string;
    lastName: string;
  } | null;
  date: Date;
  complianceType: string;
  inspector: {
    name: string;
    id: number;
  };
  actions: string[];
  documents: {
    id: number;
    url: string;
    name: string;
  }[];
}

export interface TransferWithRelations extends QuotaTransfer {
  sourceQuota: {
    quotaCode: string;
  };
  destinationQuota: {
    quotaCode: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
  } | null;
  date: Date;
  transferType: string;
  fromRightsholder: {
    companyName: string;
  };
  toRightsholder: {
    companyName: string;
  };
  notes: string | null;
  documents: {
    id: number;
    url: string;
    name: string;
  }[];
}

export interface FormattedTransfer {
  id: string;
  date: string;
  type: string;
  status: TransferStatus;
  amount: number;
  fromRightsholder: string;
  toRightsholder: string;
  approvedBy?: string;
  notes?: string;
  documents: {
    id: string;
    url: string;
    name: string;
  }[];
}

export interface CatchRecordWithRelations extends CatchRecord {
  landingSite: {
    siteName: string;
    zone: string;
  };
  rightsholder: {
    companyName: string;
  };
  monitor: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  species: {
    commonName: string;
  };
  inspector: {
    name: string;
  };
  date: Date;
  weight: number | string;
  grade: string;
  temperature: number;
  notes: string | null;
}

export interface QuotaStats {
  totalActiveQuotas: number;
  totalAllocation: number;
  totalUsed: number;
  totalBalance: number;
}
