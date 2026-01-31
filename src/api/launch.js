import { API_BASE_URL } from "./constant";

export async function getLaunchStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/launch/status`, { 
      cache: "no-store",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      throw new Error(json?.error || "Unable to check launch status");
    }
    return (
      json?.data || {
        isLaunched: false,
        launchedAt: null,
        scheduledAt: null,
        serverTime: null,
        phase: null,
      }
    );
  } catch (error) {
    // Handle network errors, timeouts, and CORS issues gracefully
    if (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('fetch')) {
      // Return default state instead of throwing - allows page to still render
      console.warn('Launch status check failed, using default state:', error.message);
      return {
        isLaunched: false,
        launchedAt: null,
        scheduledAt: null,
        serverTime: null,
        phase: null,
      };
    }
    throw error;
  }
}

export async function launchApp() {
  const res = await fetch(`${API_BASE_URL}/api/launch/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "Failed to launch");
  }
  return json?.data;
}

export async function revokeLaunch() {
  const res = await fetch(`${API_BASE_URL}/api/launch/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "Failed to revoke");
  }
  return json?.data;
}


