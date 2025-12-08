/**
 * Centralized API configuration
 * Automatically detects environment and uses the correct API URL
 */

export const getApiUrl = (): string => {
  // First, check for explicit VITE_API_URL env variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log(`Using API URL from VITE_API_URL: ${envUrl}`);
    return envUrl;
  }

  // If running in browser, auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
      const devUrl = 'http://localhost:3001';
      console.log(`Development mode detected, using: ${devUrl}`);
      return devUrl;
    }

    // Production: use same origin (assumes frontend and backend on same domain or properly configured CORS)
    const prodUrl = window.location.origin;
    console.log(`Production mode detected, using: ${prodUrl}`);
    return prodUrl;
  }

  // SSR/Node fallback
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

console.log(`[Config] API Base URL: ${API_BASE_URL}`);
