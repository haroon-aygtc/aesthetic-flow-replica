import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Centralized HTTP client for making API requests
 */
class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_URL || "/api",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Enable sending cookies with requests
    });

    // Add request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get<T>(url, config);
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post<T>(url, data, config);
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put<T>(url, data, config);
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete<T>(url, config);
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Get the underlying Axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export a default instance
const httpClient = new HttpClient();
export default httpClient;

// Also export the class for creating custom instances if needed
export { HttpClient };
