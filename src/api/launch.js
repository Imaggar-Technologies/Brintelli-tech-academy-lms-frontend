import { API_BASE_URL } from "./constant";

export async function getLaunchStatus() {
  const res = await fetch(`${API_BASE_URL}/api/launch/status`, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "Failed to fetch launch status");
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


