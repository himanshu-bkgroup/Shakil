/**
 * Resilient API Client Helper
 * Handles baseURL detection for Netlify/static hosting and prevents HTML doctype parse errors
 */

const FALLBACK_BACKEND_URL = 'https://ais-pre-c6ui2cmok7jost75x3v4vf-857452289228.asia-southeast1.run.app';

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If explicit environment variable is set
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    return `${envUrl.replace(/\/$/, '')}${cleanEndpoint}`;
  }

  // If running on Netlify or external hosting without relative backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('netlify.app') || host.includes('vercel.app')) {
      // Return relative first, but will fail over to live backend if HTML returned
      return cleanEndpoint;
    }
  }

  return cleanEndpoint;
}

/**
 * Safe fetch wrapper that handles HTML fallback gracefully and parses JSON safely
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  let url = getApiUrl(endpoint);

  let res: Response;
  let text = '';

  try {
    res = await fetch(url, options);
    text = await res.text();
  } catch (err: any) {
    // If relative fetch failed or network error and we are on Netlify, try direct cloud backend
    if (typeof window !== 'undefined' && (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app'))) {
      try {
        const directUrl = `${FALLBACK_BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        res = await fetch(directUrl, options);
        text = await res.text();
      } catch (directErr: any) {
        return {
          ok: false,
          status: 0,
          error: directErr?.message || 'Network request failed. Please check internet connection.',
        };
      }
    } else {
      return {
        ok: false,
        status: 0,
        error: err?.message || 'Network request failed. Please check internet connection.',
      };
    }
  }

  // Check if response is HTML (which happens when Netlify static redirects /* to /index.html)
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
    // If on Netlify, retry directly against the cloud backend server
    if (typeof window !== 'undefined' && !url.startsWith('http')) {
      try {
        const directUrl = `${FALLBACK_BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const retryRes = await fetch(directUrl, options);
        const retryText = await retryRes.text();
        const parsed = JSON.parse(retryText);
        return {
          ok: retryRes.ok,
          status: retryRes.status,
          data: parsed,
          error: !retryRes.ok ? parsed?.message || 'API request failed' : undefined,
        };
      } catch {
        // Fall through to error message below
      }
    }

    return {
      ok: false,
      status: res.status,
      error: 'Backend API returned HTML instead of JSON. The backend server URL needs to be configured or proxy redirects applied on your hosting.',
    };
  }

  try {
    const data = JSON.parse(text);
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? data?.message || `API error (${res.status})` : undefined,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      error: `Invalid JSON response: ${text.slice(0, 100)}`,
    };
  }
}
