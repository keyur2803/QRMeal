import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Standardized fetch wrapper for the Customer App.
 * Handles catch-all error toasts.
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
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Error: ${response.statusText}`;
      // Log for developers, toast for users
      console.error(`API Error [${response.status}]:`, errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection.");
      }
    }
    throw error;
  }
}
