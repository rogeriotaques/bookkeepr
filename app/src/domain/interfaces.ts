export type Nullable<T> = T | null;

export interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  error?: string;
}

export interface TaxData {
  shouhizei: number;
}

export interface SettingsData {
  config: TaxData;
}

export interface SettingsPayloadData {
  config: Record<string, string | number>;
}
