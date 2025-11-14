import axios, { type AxiosInstance, type AxiosError } from "axios";

// Configuration des URLs des services
const API_URLS = {
    patient: import.meta.env.VITE_PATIENT_API_URL || "/api/patient",
    doctor: import.meta.env.VITE_DOCTOR_API_URL || "/api/doctor",
    appointment: import.meta.env.VITE_APPOINTMENT_API_URL || "/api/appointment",
    billing: import.meta.env.VITE_BILLING_API_URL || "/api/billing",
};

// ✅ Instance Axios pour Patient Service
export const httpPatient: AxiosInstance = axios.create({
    baseURL: API_URLS.patient,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

// ✅ Instance Axios pour Doctor Service
export const httpDoctor: AxiosInstance = axios.create({
    baseURL: API_URLS.doctor,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

// ✅ Instance Axios pour Appointment Service
export const httpAppointment: AxiosInstance = axios.create({
    baseURL: API_URLS.appointment,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

// ✅ Instance Axios pour Billing Service
export const httpBilling: AxiosInstance = axios.create({
    baseURL: API_URLS.billing,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});