/**
 * CSRF Token Management
 * Handles CSRF token retrieval and injection for secure API requests
 */

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Get CSRF token from cookie
 */
export const getCsrfTokenFromCookie = (): string | null => {
  const name = CSRF_COOKIE_NAME + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

/**
 * Fetch CSRF token from server
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/csrf-token`,
      {
        method: "GET",
        credentials: "include", // Important: include cookies
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }

    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

/**
 * Get CSRF token (from cookie or fetch from server)
 */
export const getCsrfToken = async (): Promise<string> => {
  // Try to get from cookie first
  let token = getCsrfTokenFromCookie();

  // If not in cookie, fetch from server
  if (!token) {
    token = await fetchCsrfToken();
  }

  return token;
};

/**
 * Add CSRF token to request headers
 */
export const addCsrfHeader = (
  headers: Record<string, string> = {},
): Record<string, string> => {
  const token = getCsrfTokenFromCookie();
  if (token) {
    headers[CSRF_HEADER_NAME] = token;
  }
  return headers;
};

/**
 * Initialize CSRF token on app load
 * Call this when your app starts
 */
export const initializeCsrfToken = async (): Promise<void> => {
  try {
    await fetchCsrfToken();
    console.log("CSRF token initialized");
  } catch (error) {
    console.error("Failed to initialize CSRF token:", error);
  }
};
