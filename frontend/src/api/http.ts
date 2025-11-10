import axios, { type AxiosInstance } from "axios";

export const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8082",
    headers: { "Content-Type": "application/json" },
});
