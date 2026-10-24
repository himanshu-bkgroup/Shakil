/**
 * Resilient API Client Helper
 * Handles baseURL detection and prevents HTML doctype parse errors.
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
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Backend offline or static hosting. Using built-in database state.',
    };
  }

  // Check if response is HTML (which happens when static hosting redirects /* to /index.html)
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
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
