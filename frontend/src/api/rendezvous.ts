import { http, httpPatient, httpDoctor, httpAppointment } from "./http";
import type { RendezVous, Patient, Medecin } from "../types/rendezvous";

const BASE_PATH = "/"; // http baseURL is /api/appointment -> proxied to backend /api/rendez-vous

export const rendezvousApi = {
    // Récupérer tous les rendez-vous
    getAll: (page?: number, size?: number, sort?: string) =>
        httpAppointment
            .get<RendezVous[]>(BASE_PATH, { params: { page, size, sort } })
            .then(r => r.data)
            .catch(err => {
                console.error("Erreur getAll rendez-vous:", err);
                // Retourne un tableau vide en cas d'erreur pour ne pas casser l'UI
                return [] as RendezVous[];
            }),

    // Récupérer un rendez-vous par id
    getById: (id: number) =>
        httpAppointment.get<RendezVous>(`/${id}`).then(r => r.data).catch(err => {
            console.error('Erreur getById rendez-vous', err);
            throw err;
        }),

    // Créer un rendez-vous
    create: (rdv: RendezVous) =>
        httpAppointment.post<RendezVous>(BASE_PATH, rdv).then(r => r.data),

    // Modifier un rendez-vous
    update: (id: number, rdv: RendezVous) =>
        httpAppointment.put<RendezVous>(`/${id}`, rdv).then(r => r.data),

    // Supprimer un rendez-vous
    delete: (id: number) =>
        httpAppointment.delete<void>(`/${id}`).then(r => r.data),

    // Récupérer tous les patients (via service patient)
    getAllPatients: () =>
        httpPatient.get<Patient[]>("/")
            .then(r => r.data)
            .catch(err => {
                console.error("Erreur getAllPatients:", err);
                return [] as Patient[];
            }),

    // Récupérer tous les médecins (via service doctor)
    getAllMedecins: () =>
        httpDoctor.get<Medecin[]>("/")
            .then(r => r.data)
            .catch(err => {
                console.error("Erreur getAllMedecins:", err);
                return [] as Medecin[];
            }),

    // Lister par patient
    getByPatient: (idPatient: number) =>
        httpAppointment.get<RendezVous[]>(`/patient/${idPatient}`).then(r => r.data).catch(err => {
            console.error('Erreur getByPatient', err);
            return [] as RendezVous[];
        }),

    // Lister par médecin
    getByMedecin: (idMedecin: number) =>
        httpAppointment.get<RendezVous[]>(`/medecin/${idMedecin}`).then(r => r.data).catch(err => {
            console.error('Erreur getByMedecin', err);
            return [] as RendezVous[];
        }),
};