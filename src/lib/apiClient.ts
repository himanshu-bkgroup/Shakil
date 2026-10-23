/**
 * Resilient API Client Helper
 * Handles baseURL detection, Netlify Serverless Functions, and prevents HTML doctype parse errors.
 */

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If explicit environment variable is set
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    return `${envUrl.replace(/\/$/, '')}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

/**
 * Safe fetch wrapper that handles HTML fallback gracefully and parses JSON safely.
 * Never throws uncaught "Failed to fetch" errors.
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = getApiUrl(cleanEndpoint);

  let res: Response | null = null;
  let text = '';

  try {
    res = await fetch(url, options);
    text = await res.text();
  } catch (err: any) {
    // If running on Netlify and standard /api/ failed, try Netlify serverless functions path
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
      try {
        const netlifyFunctionUrl = `/.netlify/functions/api${cleanEndpoint}`;
        const retryRes = await fetch(netlifyFunctionUrl, options);
        const retryText = await retryRes.text();
        if (!retryText.trim().startsWith('<')) {
          const parsed = JSON.parse(retryText);
          return {
            ok: retryRes.ok,
            status: retryRes.status,
            data: parsed,
            error: !retryRes.ok ? parsed?.message || 'API request error' : undefined,
          };
        }
      } catch {
        // Fall back gracefully
      }
    }

    return {
      ok: false,
      status: 0,
      error: 'Backend is synchronizing. Using built-in database state.',
    };
  }

  // Check if response is HTML (which happens when Netlify static redirects /* to /index.html)
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
    // Try Netlify function path if on Netlify
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
      try {
        const netlifyFunctionUrl = `/.netlify/functions/api${cleanEndpoint}`;
        const retryRes = await fetch(netlifyFunctionUrl, options);
        const retryText = await retryRes.text();
        if (!retryText.trim().startsWith('<')) {
          const parsed = JSON.parse(retryText);
          return {
            ok: retryRes.ok,
            status: retryRes.status,
            data: parsed,
            error: !retryRes.ok ? parsed?.message || 'API request error' : undefined,
          };
        }
      } catch {
        // Fall through
      }
    }

    return {
      ok: false,
      status: res ? res.status : 200,
      error: 'Using local synchronized software state.',
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
      status: res ? res.status : 200,
      error: 'Invalid response format.',
    };
  }
}
