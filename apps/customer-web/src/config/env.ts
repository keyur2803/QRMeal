/**
 * Frontend environment configuration.
 * All env vars must be prefixed with VITE_ to be exposed by Vite.
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
