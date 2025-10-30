import axios, { AxiosInstance, AxiosRequestConfig, Method, isAxiosError } from 'axios';

export type HttpError = {
  status: number;
  statusText: string;
  url: string;
  body?: string;
};

function normalizeError(url: string, err: unknown): never {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const statusText = err.response?.statusText ?? 'AXIOS_ERROR';
    const bodyData = err.response?.data;
    const body = typeof bodyData === 'string' ? bodyData : bodyData ? JSON.stringify(bodyData) : undefined;
    const effectiveUrl = err.config?.url ?? url;
    const httpErr: HttpError = { status, statusText, url: effectiveUrl, body };
    throw Object.assign(new Error(`HTTP ${status} ${statusText} for ${effectiveUrl}`), httpErr);
  }
  throw err as Error;
}

export async function requestJson<T = unknown>(
  method: Method,
  url: string,
  data?: unknown,
  config: AxiosRequestConfig = {},
  client: AxiosInstance = axios
): Promise<T> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    } as Record<string, string>;
    const res = await client.request({ method, url, data, ...config, headers });
    return res.data as T;
  } catch (err) {
    return normalizeError(url, err);
  }
}

export const getJson = <T = unknown>(url: string, config: AxiosRequestConfig = {}, client: AxiosInstance = axios) =>
  requestJson<T>('GET', url, undefined, config, client);

export const postJson = <T = unknown>(url: string, body?: unknown, config: AxiosRequestConfig = {}, client: AxiosInstance = axios) =>
  requestJson<T>('POST', url, body, config, client);

export const putJson = <T = unknown>(url: string, body?: unknown, config: AxiosRequestConfig = {}, client: AxiosInstance = axios) =>
  requestJson<T>('PUT', url, body, config, client);

export const patchJson = <T = unknown>(url: string, body?: unknown, config: AxiosRequestConfig = {}, client: AxiosInstance = axios) =>
  requestJson<T>('PATCH', url, body, config, client);

export const deleteJson = <T = unknown>(url: string, config: AxiosRequestConfig = {}, client: AxiosInstance = axios) =>
  requestJson<T>('DELETE', url, undefined, config, client);
