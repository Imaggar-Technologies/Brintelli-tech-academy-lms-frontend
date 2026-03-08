import { apiRequest } from "./apiClient";

const prefix = "/api/cms/admin";

export async function getMe() {
  return apiRequest(`${prefix}/me`);
}

export async function getSeo() {
  return apiRequest(`${prefix}/seo`);
}
export async function postSeo(body) {
  return apiRequest(`${prefix}/seo`, { method: "POST", body: JSON.stringify(body) });
}
export async function putSeo(pathEnc, body) {
  return apiRequest(`${prefix}/seo/${encodeURIComponent(pathEnc)}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function getEntity(entity) {
  return apiRequest(`${prefix}/${entity}`);
}
export async function getOne(entity, id) {
  return apiRequest(`${prefix}/${entity}/${id}`);
}
export async function postEntity(entity, body) {
  return apiRequest(`${prefix}/${entity}`, { method: "POST", body: JSON.stringify(body) });
}
export async function putEntity(entity, id, body) {
  return apiRequest(`${prefix}/${entity}/${id}`, { method: "PUT", body: JSON.stringify(body) });
}
export async function deleteEntity(entity, id) {
  return apiRequest(`${prefix}/${entity}/${id}`, { method: "DELETE" });
}

export async function getGallery() {
  return apiRequest(`${prefix}/gallery`);
}
export async function putGallery(body) {
  return apiRequest(`${prefix}/gallery`, { method: "PUT", body: JSON.stringify(body) });
}

export async function getMedia() {
  return apiRequest(`${prefix}/media`);
}
export async function uploadFile(file, alt = "") {
  const { store } = await import("../store");
  const { API_BASE_URL } = await import("./constant");
  const token = store.getState().auth?.token;
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);
  const res = await fetch(`${API_BASE_URL}${prefix}/media/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}
