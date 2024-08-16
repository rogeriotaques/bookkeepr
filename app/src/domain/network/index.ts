import axios from 'axios';

import { ApiResponse, SettingsData, SettingsPayloadData } from '@/domain/interfaces';
import { respHandler, errorHandler } from '@/domain/network/utils';
import { BASE_URL } from '@/domain/constants';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  },
});

API.interceptors.response.use(respHandler, errorHandler);

export const getSettings = (): Promise<SettingsData> => API.get('/v1/settings');
export const setSettings = (data: SettingsPayloadData): Promise<ApiResponse> => API.post('/v1/settings', data);

export const getWallets = (): Promise<ApiResponse> => API.get('/v1/wallets');
export const deleteWallet = (id: number): Promise<ApiResponse> => API.delete(`/v1/wallets/${id}`);

export const runVacuum = (): Promise<ApiResponse> => API.post('/v1/settings/vacuum');
