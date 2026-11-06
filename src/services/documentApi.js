const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.message || "The document request could not be completed.");
    error.code = body?.code || "DOCUMENT_REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }
  return body;
}

export async function listAvailableDocuments(token) {
  const response = await fetch(`${apiBaseUrl}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(response);
}

export async function searchEmployeeDocuments(query, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return readResponse(response);
}

export async function explainSearchResults(query, documentIds, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/assistant/explain`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, documentIds }),
  });
  return readResponse(response);
}

export async function uploadEmployeeDocument(file, details, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
      "X-File-Type": encodeURIComponent(file.type),
      "X-Document-Title": encodeURIComponent(details.title),
      "X-Document-Description": encodeURIComponent(details.description),
      "X-Document-Category": encodeURIComponent(details.category),
      "X-Document-Tags": encodeURIComponent(JSON.stringify(details.tags)),
    },
    body: file,
  });
  return readResponse(response);
}

export async function getEmployeeDocumentDownload(documentId, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/${encodeURIComponent(documentId)}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(response);
}

export async function getDocumentAccessInfo(documentId, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/${encodeURIComponent(documentId)}/access-info`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(response);
}

export async function requestDocumentAccess(documentId, reason, token) {
  const response = await fetch(`${apiBaseUrl}/api/documents/${encodeURIComponent(documentId)}/access-requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  return readResponse(response);
}
