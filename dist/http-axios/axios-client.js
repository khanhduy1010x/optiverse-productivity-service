"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosClient = void 0;
const axios_1 = __importDefault(require("axios"));
class AxiosClient {
    constructor(baseUrl) {
        this.instance = axios_1.default.create({
            timeout: 2000,
            headers: { 'Content-Type': 'application/json' },
        });
        this.instance.defaults.baseURL = baseUrl;
        this.instance.interceptors.request.use((config) => {
            return config;
        }, (error) => {
            console.error('AxiosClient: Request error:', error.message);
            return Promise.reject(error);
        });
        this.instance.interceptors.response.use((response) => {
            return response;
        }, (error) => {
            console.error('AxiosClient: Response error:', error.message);
            return Promise.reject(error);
        });
    }
    async get(url) {
        return this.instance.get(url);
    }
    async post(url, data) {
        return this.instance.post(url, data);
    }
    async put(url, data) {
        return this.instance.put(url, data);
    }
    async delete(url) {
        return this.instance.delete(url);
    }
}
exports.AxiosClient = AxiosClient;
//# sourceMappingURL=axios-client.js.map