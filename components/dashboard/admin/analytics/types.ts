export interface CatchData {
  species: string;
  catch: number;
  quota: number;
  utilization: number;
}

export interface VesselTrendData {
  date: string;
  active: number;
  fishing: number;
  docked: number;
}

export interface Alert {
  id: string;
  type: 'quota' | 'vessel' | 'system';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}
