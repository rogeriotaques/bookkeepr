import axios from 'axios';

import { ApiResponse, SettingsPayloadData, Wallet, Group, Entry } from '@/domain/interfaces';
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

export const http = API;

export const setSettings = (data: SettingsPayloadData): Promise<ApiResponse> => API.post('/settings', data);

export const addWallet = (data: Wallet): Promise<ApiResponse> => API.post('/wallets', data);
export const updateWallet = (id: number, data: Wallet): Promise<ApiResponse> => API.patch(`/wallets/${id}`, data);
export const deleteWallet = (id: number): Promise<ApiResponse> => API.delete(`/wallets/${id}`);

export const addGroup = (data: Group): Promise<ApiResponse> => API.post('/groups', data);
export const updateGroup = (id: number, data: Group): Promise<ApiResponse> => API.patch(`/groups/${id}`, data);
export const deleteGroup = (id: number): Promise<ApiResponse> => API.delete(`/groups/${id}`);

export const addEntry = (data: Entry): Promise<ApiResponse> => API.post('/entries', data);
export const updateEntry = (id: number, data: Entry): Promise<ApiResponse> => API.patch(`/entries/${id}`, data);
export const deleteEntry = (id: number): Promise<ApiResponse> => API.delete(`/entries/${id}`);

export const runVacuum = (): Promise<ApiResponse> => API.post('/settings/vacuum');
