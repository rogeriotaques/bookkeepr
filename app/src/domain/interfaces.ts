export type Nullable<T> = T | null;

export interface TaxData {
  shouhizei: number;
}

export interface SettingsData {
  config: TaxData;
  dbFilePath?: string;
}

export interface SettingsPayloadData {
  config: Record<string, string | number>;
}

export interface Wallet {
  id: number;
  name: string;
  active: number;
}

export interface Group {
  id: number;
  code: string;
  name: string;
  operation: string;
  active: number;
}

export interface ApiResponse<T = any> {
  wallets?: Wallet[];
  groups?: Group[];
  success?: boolean;
  error?: string;
}
