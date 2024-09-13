export type Nullable<T> = T | null;

export interface CurrencyLocale {
  currencyCode: string;
  currencyLocale: string;
}

export interface ConfigData extends CurrencyLocale {
  usePasswd: boolean | null;
  shouhizei: number;
}

export interface SettingsData {
  config: ConfigData;
  dbFilePath?: string;
}

export interface SettingsPayloadData {
  config: Record<string, string | number>;
}

export interface Wallet {
  id?: number;
  name: string;
  active: 1 | 0;
}

export interface Group {
  id?: number;
  code: string;
  name: string;
  operation: string;
  active: 1 | 0;
}

export interface Entry {
  id?: number;
  amount: number;
  description: string;
  group: string;
  wallet: number;
  date: string;
}

export interface ExtendedEntry extends Entry {
  groupName: string;
  walletName: string;
  operation: string;
}

export interface ApiResponse<T = any> {
  [key: string]: T;
}
