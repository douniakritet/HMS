import { http } from "./http";
import type { Doctor } from "../types/doctor";

export const listDoctors = (q?: string) =>
    http.get<Doctor[]>("/api/doctors", { params: { search: q } }).then(r=>r.data);

export const getDoctor = (id: number) =>
    http.get<Doctor>(`/api/doctors/${id}`).then(r => r.data);

export const createDoctor = (d: Doctor) =>
    http.post<Doctor>("/api/doctors", d).then(r => r.data);

export const updateDoctor = (id: number, d: Doctor) =>
    http.put<Doctor>(`/api/doctors/${id}`, d).then(r => r.data);

export const deleteDoctor = (id: number) =>
    http.delete<void>(`/api/doctors/${id}`).then(r => r.data);