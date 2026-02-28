/**
 * Centralized API configuration for the Nexus Pharmacy frontend.
 * All API calls should use this base URL instead of hardcoding localhost.
 */
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Helper to construct full API URLs.
 * Usage: apiUrl("/api/products") → "http://localhost:8000/api/products"
 */
export function apiUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}
