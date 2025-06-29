export declare class AxiosClient {
    private instance;
    constructor(baseUrl: string);
    get<T>(url: string): Promise<Axios.AxiosXHR<T>>;
    post<T>(url: string, data?: any): Promise<Axios.AxiosXHR<T>>;
    put<T>(url: string, data?: any): Promise<Axios.AxiosXHR<T>>;
    delete<T>(url: string): Promise<Axios.AxiosXHR<T>>;
}
