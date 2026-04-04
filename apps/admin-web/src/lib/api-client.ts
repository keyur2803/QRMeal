import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Standardized fetch wrapper for the QRMEAL platform.
 * Handles headers, credentials (cookies), and global error messaging.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Required for sending httpOnly cookies
    credentials: "include",
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized (expired or missing session)
    if (response.status === 401) {
      // Clear client-side state if needed, then redirect
      if (!window.location.pathname.startsWith("/login")) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Error: ${response.statusText}`;
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error && error.message !== "Unauthorized") {
      console.error("API Call Failed:", error);
      // Fallback message for network errors
      if (error.message.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection.");
      }
    }
    throw error;
  }
}
