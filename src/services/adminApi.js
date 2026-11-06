const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new Error("Could not reach the IRIS API.");
    error.code = "API_UNAVAILABLE";
    throw error;
  }

  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.message || "The request could not be completed.");
    error.code = body?.code || "REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }
  return body;
}

export function signInAdmin(username, password) {
  return request("/api/admin/session", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getAdminSession() {
  return request("/api/admin/session");
}

export function getAdminDashboard() {
  return request("/api/admin/dashboard");
}

export function signOutAdmin() {
  return request("/api/admin/session", { method: "DELETE" });
}

export function getAdminDepartments() {
  return request("/api/admin/departments");
}

export function createAdminDepartment(name, description = "") {
  return request("/api/admin/departments", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function getAdminUsers() {
  return request("/api/admin/users");
}

export function approveAdminUser(userId) {
  return request(`/api/admin/users/${encodeURIComponent(userId)}/approve`, { method: "POST" });
}

export function getAdminDocuments() {
  return request("/api/admin/documents");
}

export function getAdminDocumentDownload(documentId) {
  return request(`/api/admin/documents/${encodeURIComponent(documentId)}/download`);
}

export function reviewAdminDocument(documentId, review) {
  return request(`/api/admin/documents/${encodeURIComponent(documentId)}/review`, {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export function getAdminAccessRequests() {
  return request("/api/admin/access-requests");
}

export function reviewAdminAccessRequest(requestId, decision) {
  return request(`/api/admin/access-requests/${encodeURIComponent(requestId)}/review`, {
    method: "POST",
    body: JSON.stringify(decision),
  });
}

export function createUserInvitation(user) {
  return request("/api/admin/users/invitations", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function getAdminIngestion() {
  return request("/api/admin/ingestion");
}

export function startAdminIngestion(documentId) {
  return request(`/api/admin/ingestion/${encodeURIComponent(documentId)}`, { method: "POST" });
}
