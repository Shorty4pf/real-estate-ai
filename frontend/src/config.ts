/**
 * Centralized API configuration
 * Automatically detects environment and uses the correct API URL
 */

export const getApiUrl = (): string => {
  // If running in browser, auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
      return 'http://localhost:3001';
    }

    // PRODUCTION - HARDCODED BACKEND URL
    return 'https://real-estate-ai-backend-cy05.onrender.com';
  }

  // SSR/Node fallback
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

console.log(`[Config] API Base URL: ${API_BASE_URL}`);
