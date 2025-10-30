export interface Doctor {
    id?: number;   ///
    firstName: string;  //////
    lastName: string; ///
    email: string;///
    phone: string;///
    dateOfBirth?: string;     // "YYYY-MM-DD"
    gender?: "MALE" | "FEMALE";///
    active?: boolean;  ///////
    registrationDate?: string; // "YYYY-MM-DD" /////////
    specialization: string;
}