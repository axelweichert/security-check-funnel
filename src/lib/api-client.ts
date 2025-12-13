import { ApiResponse } from "../../shared/types"

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Determine the correct base URL depending on the environment.
  // In development we proxy requests to the backend running on port 3000.
  // In production (or preview) we use a relative path (same-origin).
  // Determine the correct base URL depending on the environment.
  // In development we proxy requests to the backend running on port 3000.
  // In production (or preview) we use a relative path (same-origin).
  let baseUrl = '';
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    baseUrl = 'http://localhost:3000';
  }
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...(init ?? {})
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) throw new Error(json.error || 'Request failed')
  return json.data
}