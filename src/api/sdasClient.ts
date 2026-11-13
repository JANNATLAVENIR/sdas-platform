import type { UserRole } from '../types/sdas';

const TOKEN_KEY = 'sdas_session_token';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  regionId: string;
  districtId: string | null;
  assignedArea: string;
  mfaEnabled: boolean;
  isDevAccount: boolean;
}

export interface DevAccountSummary {
  order: number;
  code: string;
  email: string;
  role: UserRole;
  fullName: string;
  assignedArea: string;
}

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: { method?: string; body?: any; apiKey?: string; skipAuth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = !options.skipAuth ? getStoredToken() : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.apiKey) {
    headers['X-API-Key'] = options.apiKey;
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function loginWithCredentials(email: string, password: string): Promise<{
  token: string;
  user: AuthUser;
  breakGlassActive: boolean;
}> {
  const data = await apiRequest<{ token: string; user: AuthUser; breakGlassActive: boolean }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true
  });
  setStoredToken(data.token);
  return data;
}

export async function fetchCurrentSession(): Promise<{
  user: AuthUser;
  breakGlassActive: boolean;
} | null> {
  if (!getStoredToken()) return null;
  try {
    return await apiRequest<{ user: AuthUser; breakGlassActive: boolean }>('/api/auth/me');
  } catch {
    setStoredToken(null);
    return null;
  }
}

export async function logoutSession(): Promise<void> {
  if (getStoredToken()) {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // clear local token regardless
    }
  }
  setStoredToken(null);
}

export async function fetchDevAccounts(): Promise<DevAccountSummary[]> {
  try {
    const data = await apiRequest<{ accounts: DevAccountSummary[] }>('/api/auth/dev-accounts', {
      skipAuth: true
    });
    return data.accounts || [];
  } catch {
    return [];
  }
}
