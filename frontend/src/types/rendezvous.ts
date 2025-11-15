export interface RendezVous {
    idRendezVous?: number;
    dateRendezVous: string;
    heureRdv: string;
    idPatient: number;
    idMedecin: number;
    status: 'PLANIFIE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';
    motif?: string;
    notes?: string;
}

export interface Patient {
    idPatient: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
}

export interface Medecin {
    idMedecin: number;
    nom: string;
    prenom?: string;
    specialite: string;
    email?: string;
}

export type StatusRendezVous = 'PLANIFIE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';