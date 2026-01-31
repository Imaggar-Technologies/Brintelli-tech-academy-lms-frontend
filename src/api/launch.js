import { API_BASE_URL } from "./constant";

export async function getLaunchStatus() {
  try {
    // Create an AbortController for timeout (more compatible than AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const url = `${API_BASE_URL}/api/launch/status`;
    console.log('🔍 Fetching launch status from:', url);
    
    const res = await fetch(url, { 
      cache: "no-store",
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const errorMsg = json?.error || `HTTP ${res.status}: ${res.statusText}`;
      console.error('❌ Launch status API error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('✅ Launch status received:', json?.data);
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
    if (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('network') || error.message.includes('CORS')) {
      // Return default state instead of throwing - allows page to still render
      console.warn('⚠️ Launch status check failed, using default state:', error.message);
      console.warn('API_BASE_URL:', API_BASE_URL);
      return {
        isLaunched: false,
        launchedAt: null,
        scheduledAt: null,
        serverTime: null,
        phase: null,
      };
    }
    console.error('❌ Launch status error:', error);
    throw error;
  }
}

export async function launchApp() {
  try {
    const url = `${API_BASE_URL}/api/launch/launch`;
    console.log('🚀 Launching app via:', url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
    });
    
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const errorMsg = json?.error || `HTTP ${res.status}: ${res.statusText}`;
      console.error('❌ Launch API error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('✅ Launch successful:', json?.data);
    return json?.data;
  } catch (error) {
    console.error('❌ Launch error:', error);
    if (error.message.includes('fetch') || error.message.includes('CORS') || error.message.includes('network')) {
      throw new Error(`Failed to connect to API. Please check if the backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
}

export async function revokeLaunch() {
  try {
    const url = `${API_BASE_URL}/api/launch/revoke`;
    console.log('🔄 Revoking launch via:', url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
    });
    
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const errorMsg = json?.error || `HTTP ${res.status}: ${res.statusText}`;
      console.error('❌ Revoke API error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('✅ Revoke successful:', json?.data);
    return json?.data;
  } catch (error) {
    console.error('❌ Revoke error:', error);
    if (error.message.includes('fetch') || error.message.includes('CORS') || error.message.includes('network')) {
      throw new Error(`Failed to connect to API. Please check if the backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
}


