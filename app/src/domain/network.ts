import axios from 'axios';

import { SettingsData } from '@/domain/interfaces';

const BASE_URL = 'http://localhost:8083/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  },
});

/**
 * A PRO response handler for Axios
 * @returns ResponseObject
 */
export const respHandler = (resp: any): Promise<any> => {
  return resp?.data;
};

/**
 * A PRO error handler for Axios
 * @returns ErrorObject
 */
export const errorHandler = (err: any): Promise<any> => {
  let error;

  if (err.response) {
    // The request was made and the server responded with
    // a status code that falls out of the range of 2xx
    error = {
      code: err.response.status,
      message: err.response.data.message,
    };
  } else if (err.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in
    // the browser and an instance of http.ClientRequest in node.js
    const data = err.request.responseText ? JSON.parse(err.request.responseText) : {};

    error = {
      code: data.status || 0,
      message: data.message || 'Unexpected error!',
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    error = {
      code: parseInt(err.message.replace(/[^0-9]/g, ''), 10) || 0,
      message: err.message,
    };
  }

  return Promise.reject(error);
};

API.interceptors.response.use(respHandler, errorHandler);

export const getSettings = (): Promise<SettingsData> => API.get('/v1/settings');
