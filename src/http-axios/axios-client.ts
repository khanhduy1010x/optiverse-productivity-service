import axios from 'axios';

export class AxiosClient {
  private instance = axios.create({
    timeout: 2000,
    headers: { 'Content-Type': 'application/json' },
  });

  constructor(baseUrl: string) {
    this.instance.defaults.baseURL = baseUrl;

    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('AxiosClient: Request error:', error.message);
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('AxiosClient: Response error:', error.message);
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string) {
    return this.instance.get<T>(url);
  }

  async post<T>(url: string, data?: any) {
    return this.instance.post<T>(url, data);
  }

  async put<T>(url: string, data?: any) {
    return this.instance.put<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.instance.delete<T>(url);
  }
}
