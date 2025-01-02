// Database Type Declarations
import { PrismaClient } from '@prisma/client';

export interface DatabaseConnection {
  client: PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface DatabaseTransaction {
  run<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
}

export interface DatabaseQueryOptions {
  cache?: boolean;
  timeout?: number;
  retries?: number;
}

export interface DatabaseLogger {
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
  logQuery(query: string, params?: any[]): void;
}

export interface DatabaseHealthCheck {
  ping(): Promise<boolean>;
  getConnectionStatus(): 'connected' | 'disconnected' | 'error';
  getConnectionMetrics(): {
    totalConnections: number;
    activeConnections: number;
    connectionTime: number;
  };
}

export interface DatabaseMigration {
  migrate(): Promise<void>;
  rollback(steps?: number): Promise<void>;
  getCurrentVersion(): Promise<string>;
}

export interface DatabaseBackup {
  createBackup(options?: { path?: string; compress?: boolean }): Promise<string>;
  restoreBackup(backupPath: string): Promise<void>;
}

export interface DatabaseSeeding {
  seed(data?: any): Promise<void>;
  clearData(): Promise<void>;
}

export type DatabaseModule = DatabaseConnection &
  DatabaseTransaction &
  DatabaseLogger &
  DatabaseHealthCheck &
  DatabaseMigration &
  DatabaseBackup &
  DatabaseSeeding;

// Extend PrismaClient with additional methods
declare module '@prisma/client' {
  interface PrismaClient {
    $transaction<T>(
      callback: (tx: PrismaClient) => Promise<T>,
      options?: DatabaseQueryOptions
    ): Promise<T>;

    $healthCheck(): Promise<DatabaseHealthCheck>;
    $backup(options?: any): Promise<string>;
    $seed(data?: any): Promise<void>;
  }
}
