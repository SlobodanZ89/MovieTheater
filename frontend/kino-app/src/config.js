// Central place for frontend → backend URLs.
// Override locally by setting VITE_API_BASE_URL, e.g. http://localhost:8080/api
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8080/api';

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    // Fallback: assume API_BASE_URL is already an origin or relative.
    return API_BASE_URL.replace(/\/+api\/?$/, '');
  }
})();

