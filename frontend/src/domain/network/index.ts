import axios from 'axios';
import { computed } from 'vue';

import { ApiResponse, SettingsPayloadData, Wallet, Group, Entry } from '@/domain/interfaces';
import { respHandler, errorHandler } from '@/domain/network/utils';
import { BASE_URL } from '@/domain/constants';

import { useState } from '@/composable/useState';

const state = useState();

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  },
});

API.interceptors.response.use(respHandler, errorHandler);

export const http = API;

const headers = computed(() => ({ headers: { Authorization: `Basic ${state.credential ?? btoa('user:empty-password')}` } }));

export const setSettings = (data: SettingsPayloadData): Promise<ApiResponse> => API.post('/settings', data, headers.value);

export const addWallet = (data: Wallet): Promise<ApiResponse> => API.post('/wallets', data, headers.value);
export const updateWallet = (id: number, data: Wallet): Promise<ApiResponse> => API.patch(`/wallets/${id}`, data, headers.value);
export const deleteWallet = (id: number): Promise<ApiResponse> => API.delete(`/wallets/${id}`, headers.value);

export const addGroup = (data: Group): Promise<ApiResponse> => API.post('/groups', data, headers.value);
export const updateGroup = (id: number, data: Group): Promise<ApiResponse> => API.patch(`/groups/${id}`, data, headers.value);
export const deleteGroup = (id: number): Promise<ApiResponse> => API.delete(`/groups/${id}`, headers.value);

export const addEntry = (data: Entry): Promise<ApiResponse> => API.post('/entries', data, headers.value);
export const updateEntry = (id: number, data: Entry): Promise<ApiResponse> => API.patch(`/entries/${id}`, data, headers.value);
export const deleteEntry = (id: number): Promise<ApiResponse> => API.delete(`/entries/${id}`, headers.value);

export const runVacuum = (): Promise<ApiResponse> => API.post('/settings/vacuum', {}, headers.value);

export const authUser = (password: string): Promise<ApiResponse> => API.post('/auth', { password });
export const saveUserPassword = (password: string): Promise<ApiResponse> => API.post('/auth/passwd', { password }, headers.value);
export const disableUserPassword = (): Promise<ApiResponse> => API.delete('/auth/passwd', headers.value);
