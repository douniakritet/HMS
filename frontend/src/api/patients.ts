import { httpPatient } from "./http";
import type { Patient } from "../types/patient";

export const patientApi = {
    list: (q?: string) =>
        httpPatient.get<Patient[]>("", { params: { search: q } }).then(res => res.data),

    getById: (id: number) =>
        httpPatient.get<Patient>(`/${id}`).then(res => res.data),

    create: (p: Patient) =>
        httpPatient.post<Patient>("", p).then(res => res.data),

    update: (id: number, p: Patient) =>
        httpPatient.put<Patient>(`/${id}`, p).then(res => res.data),

    delete: (id: number) =>
        httpPatient.delete<void>(`/${id}`).then(res => res.data),
};
