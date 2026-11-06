const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function fetchCurrentAppUser(sessionToken) {
  if (!sessionToken) {
    const error = new Error("A Clerk session token is not available.");
    error.code = "UNAUTHENTICATED";
    throw error;
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
  } catch {
    const error = new Error("The IRIS API could not be reached.");
    error.code = "API_UNAVAILABLE";
    throw error;
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "Unable to verify this account.");
    error.code = body.code || "USER_LOOKUP_FAILED";
    error.status = response.status;
    throw error;
  }

  return body.user;
}
