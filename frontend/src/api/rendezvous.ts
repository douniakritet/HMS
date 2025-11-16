import { httpAppointment, httpPatient, httpDoctor } from "./http";
import type { RendezVous, Patient, Medecin } from "../types/rendezvous";

export const rendezvousApi = {
    getAll: (page?: number, size?: number, sort?: string) =>
        httpAppointment.get<RendezVous[]>("", { params: { page, size, sort } }).then(res => res.data),

    getById: (id: number) =>
        httpAppointment.get<RendezVous>(`/${id}`).then(res => res.data),

    create: (rdv: RendezVous) =>
        httpAppointment.post<RendezVous>("", rdv).then(res => res.data),

    update: (id: number, rdv: RendezVous) =>
        httpAppointment.put<RendezVous>(`/${id}`, rdv).then(res => res.data),

    delete: (id: number) =>
        httpAppointment.delete<void>(`/${id}`).then(res => res.data),

    // Patients & Medecins lists
    getAllPatients: () =>
        httpPatient.get<Patient[]>("").then(res => res.data),

    getAllMedecins: () =>
        httpDoctor.get<Medecin[]>("").then(res => res.data),

    getByPatient: (idPatient: number) =>
        httpAppointment.get<RendezVous[]>(`/patient/${idPatient}`).then(res => res.data),

    getByMedecin: (idMedecin: number) =>
        httpAppointment.get<RendezVous[]>(`/medecin/${idMedecin}`).then(res => res.data),
};
