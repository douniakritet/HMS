export interface Patient {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;     // "YYYY-MM-DD"
    gender?: "MALE" | "FEMALE" | "OTHER";
    bloodType?: "A_POSITIVE"|"A_NEGATIVE"|"B_POSITIVE"|"B_NEGATIVE"|"AB_POSITIVE"|"AB_NEGATIVE"|"O_POSITIVE"|"O_NEGATIVE";
    address?: string;
    active?: boolean;
    registrationDate?: string; // "YYYY-MM-DD"
}
