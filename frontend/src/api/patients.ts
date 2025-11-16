import { http } from "./http";
import type { Patient } from "../types/patient";

export const listPatients = (q?: string) =>
    http.get<Patient[]>("/api/patients", { params: { search: q } }).then(r=>r.data);

export const getPatient = (id: number) =>
    http.get<Patient>(`/api/patients/${id}`).then(r=>r.data);

export const createPatient = (p: Patient) =>
    http.post<Patient>("/api/patients", p).then(r=>r.data);

export const updatePatient = (id: number, p: Patient) =>
    http.put<Patient>(`/api/patients/${id}`, p).then(r=>r.data);

export const deletePatient = (id: number) =>
    http.delete<void>(`/api/patients/${id}`).then(r=>r.data);
