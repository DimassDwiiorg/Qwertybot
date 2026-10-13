/**
 * API base URL resolver that automatically routes requests to https://qwertybot.biz.id
 * when running inside an Android / Capacitor native environment, while maintaining
 * standard relative URLs for Vite local dev and web production.
 */
export const API_BASE = (typeof window !== 'undefined' && (
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'file:' ||
  (window.location.hostname === 'localhost' && window.location.port !== '5173')
)) ? 'https://qwertybot.biz.id' : '';

export const apiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${clean}`;
};
