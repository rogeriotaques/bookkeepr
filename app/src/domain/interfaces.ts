export type Nullable<T> = T | null;

export interface TaxData {
  shouhizei: number;
}

export interface SettingsData {
  config: TaxData;
}
