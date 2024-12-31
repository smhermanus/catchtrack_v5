'use client';

import { AlertSystem } from './alert-system';
import { Alert } from './types';

interface ClientAlertSystemProps {
  alerts: Alert[];
}

export function ClientAlertSystem({ alerts }: ClientAlertSystemProps) {
  return <AlertSystem alerts={alerts} />;
}
