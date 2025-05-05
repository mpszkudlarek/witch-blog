import { ApiConfig } from "@/config/api-config"
import type { ApiResponse } from "@/types/api"

// Default request options
const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  credentials: "include", // Include cookies for session management
}

/**
 * API Client for making HTTP requests to the backend
 */
export const ApiClient = {
  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint path
   * @param params - Query parameters
   * @param options - Additional fetch options
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = new URL(`${ApiConfig.api.baseUrl}/${ApiConfig.api.version}${endpoint}`)

    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value)
        }
      })
    }

    // Merge default options with provided options
    const requestOptions: RequestInit = {
      ...DEFAULT_OPTIONS,
      ...options,
      method: "GET",
    }

    return this.request<T>(url.toString(), requestOptions)
  },

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param options - Additional fetch options
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${ApiConfig.api.baseUrl}/${ApiConfig.api.version}${endpoint}`

    // Merge default options with provided options
    const requestOptions: RequestInit = {
      ...DEFAULT_OPTIONS,
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }

    return this.request<T>(url, requestOptions)
  },

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param options - Additional fetch options
   * @returns Promise with the response data
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${ApiConfig.api.baseUrl}/${ApiConfig.api.version}${endpoint}`

    // Merge default options with provided options
    const requestOptions: RequestInit = {
      ...DEFAULT_OPTIONS,
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }

    return this.request<T>(url, requestOptions)
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint path
   * @param options - Additional fetch options
   * @returns Promise with the response data
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${ApiConfig.api.baseUrl}/${ApiConfig.api.version}${endpoint}`

    // Merge default options with provided options
    const requestOptions: RequestInit = {
      ...DEFAULT_OPTIONS,
      ...options,
      method: "DELETE",
    }

    return this.request<T>(url, requestOptions)
  },

  /**
   * Make a request to the API with the given options
   * @param url - Full URL to request
   * @param options - Fetch options
   * @returns Promise with the response data
   */
  async request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    try {
      // Add authorization header if token exists
      const token = localStorage.getItem("auth_token")
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // Add timeout to the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), ApiConfig.api.timeout)

      // Make the request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      // Parse the response
      const data = await response.json()

      // Handle API errors
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || "UNKNOWN_ERROR",
            message: data.error?.message || "An unknown error occurred",
            details: data.error?.details,
          },
          timestamp: new Date().toISOString(),
        }
      }

      // Return successful response
      return {
        success: true,
        data: data.data || data,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: "The request timed out",
          },
          timestamp: new Date().toISOString(),
        }
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "A network error occurred",
        },
        timestamp: new Date().toISOString(),
      }
    }
  },
}
