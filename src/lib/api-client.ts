import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let baseUrl = '';
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    baseUrl = 'http://localhost:3000';
  }
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...(init ?? {})
  });
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      // Try to parse as JSON first, as this is the expected error format
      const json = await res.json() as ApiResponse;
      errorMsg = json.error || errorMsg;
    } catch (e) {
      // If JSON parsing fails, it might be a plain text or HTML error page
      try {
        const text = await res.text();
        // Avoid using the full HTML page as an error message if it's too long
        errorMsg = text.length < 500 ? text : errorMsg;
      } catch (textError) {
        // Ignore if reading text also fails
      }
    }
    throw new Error(errorMsg);
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error || 'API request was not successful but did not return an error message.');
  }
  return json.data;
}