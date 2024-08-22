import axios from 'axios';

import { ApiResponse, SettingsData, SettingsPayloadData, Wallet, Group, Entry } from '@/domain/interfaces';
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
export const addWallet = (data: Wallet): Promise<ApiResponse> => API.post('/v1/wallets', data);
export const updateWallet = (id: number, data: Wallet): Promise<ApiResponse> => API.patch(`/v1/wallets/${id}`, data);
export const deleteWallet = (id: number): Promise<ApiResponse> => API.delete(`/v1/wallets/${id}`);

export const getGroups = (): Promise<ApiResponse> => API.get('/v1/groups');
export const addGroup = (data: Group): Promise<ApiResponse> => API.post('/v1/groups', data);
export const updateGroup = (id: number, data: Group): Promise<ApiResponse> => API.patch(`/v1/groups/${id}`, data);
export const deleteGroup = (id: number): Promise<ApiResponse> => API.delete(`/v1/groups/${id}`);

export const getEntries = (): Promise<ApiResponse> => API.get('/v1/entries');
export const addEntry = (data: Entry): Promise<ApiResponse> => API.post('/v1/entries', data);
export const updateEntry = (id: number, data: Entry): Promise<ApiResponse> => API.patch(`/v1/entries/${id}`, data);
export const deleteEntry = (id: number): Promise<ApiResponse> => API.delete(`/v1/entries/${id}`);

export const runVacuum = (): Promise<ApiResponse> => API.post('/v1/settings/vacuum');
