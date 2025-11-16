import axios, { type AxiosInstance } from "axios";

const BASE_URL_RENDEZVOUS = "http://localhost:8083";
const BASE_URL_PATIENT = "http://localhost:8081";
const BASE_URL_DOCTOR = "http://localhost:8084";


function createAuthenticatedAxios(baseURL: string): AxiosInstance {
    const instance = axios.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    return instance;
}

// Axios instances per backend
export const httpAppointment: AxiosInstance = createAuthenticatedAxios(`${BASE_URL_RENDEZVOUS}/api/rendezvous`);
export const httpPatient: AxiosInstance = createAuthenticatedAxios(`${BASE_URL_PATIENT}/api/patients`);
export const httpDoctor: AxiosInstance = createAuthenticatedAxios(`${BASE_URL_DOCTOR}/api/medecins`);