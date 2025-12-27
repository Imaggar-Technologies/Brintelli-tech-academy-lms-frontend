import { API_BASE_URL } from "./constant";
import { store } from "../store";
import { selectToken, selectRefreshToken, logout, setCredentials } from "../store/slices/authSlice";

const getAuthToken = () => selectToken(store.getState());
const getRefreshToken = () => selectRefreshToken(store.getState());

const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Token refresh failed");

  store.dispatch(
    setCredentials({
      user: data.data.user,
      token: data.data.token,
      refreshToken: data.data.refreshToken || refreshToken,
    })
  );
  return data.data.token;
};

/**
 * Multipart/form-data upload helper with automatic token refresh.
 */
export async function apiUpload(endpoint, formData, options = {}) {
  let token = getAuthToken();

  const makeRequest = async (authToken) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || "POST",
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...(options.headers || {}),
        // DO NOT set Content-Type; browser sets boundary for FormData
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401 && authToken && endpoint !== "/api/auth/refresh") {
      const newToken = await refreshAuthToken();
      return makeRequest(newToken);
    }

    if (!response.ok) {
      throw new Error(data?.error || "Upload failed");
    }

    return data;
  };

  try {
    return await makeRequest(token);
  } catch (error) {
    // If refresh failed, logout
    if (String(error?.message || "").toLowerCase().includes("authentication")) {
      store.dispatch(logout());
      window.location.href = "/switch-user";
    }
    throw error;
  }
}


