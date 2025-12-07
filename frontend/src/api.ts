// frontend/src/api.ts
/**
 * Centralized API client for frontend-backend communication.
 * Uses VITE_API_URL env variable or auto-detects based on hostname.
 */

const getApiUrl = () => {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env;
  
  // In production, use the same origin (backend will be on same domain or Render service)
  // In dev, default to localhost:3001
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) return 'http://localhost:3001';
    // Production: use the current origin or a configured backend URL
    return window.location.origin;
  }
  
  return 'http://localhost:3001';
};

export const API_URL = getApiUrl();

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Auth endpoints
export async function signup(email: string, password: string) {
  return apiFetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return apiFetch('/api/me');
}

export async function getSession(sessionId: string) {
  return apiFetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`);
}

// Deals endpoints
export async function saveDeal(deal: {
  title?: string;
  location?: string;
  input: Record<string, any>;
  metrics: Record<string, any>;
  tags?: string[];
  note?: string;
}) {
  return apiFetch('/api/deals', {
    method: 'POST',
    body: JSON.stringify(deal),
  });
}

export async function listDeals() {
  return apiFetch('/api/deals');
}

export async function updateDeal(dealId: number, updates: { tags?: string[]; note?: string }) {
  return apiFetch(`/api/deals/${dealId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Alerts endpoints
export async function createAlert(criteria: string) {
  return apiFetch('/api/alerts', {
    method: 'POST',
    body: JSON.stringify({ criteria }),
  });
}

export async function listAlerts() {
  return apiFetch('/api/alerts');
}

export async function deleteAlert(alertId: number) {
  return apiFetch(`/api/alerts/${alertId}`, {
    method: 'DELETE',
  });
}

// Analysis endpoints
export async function getAdvancedAnalysis() {
  return apiFetch('/api/analysis/advanced');
}
