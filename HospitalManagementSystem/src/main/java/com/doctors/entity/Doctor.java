package com.doctors.entity;
import com.doctors.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 50, message = "Le prénom ne doit pas dépasser 50 caractères")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 50, message = "Le nom ne doit pas dépasser 50 caractères")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotNull(message = "Le genre est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Past(message = "La date de naissance doit être dans le passé")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @NotBlank(message = "L'email professionnel est obligatoire")
    @Email(message = "Veuillez fournir une adresse email valide")
    @Column(name = "professional_email", unique = true, nullable = false)
    private String professionalEmail;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Le numéro doit contenir entre 10 et 15 chiffres")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @NotBlank(message = "La spécialité médicale est obligatoire")
    @Size(max = 100, message = "La spécialité ne doit pas dépasser 100 caractères")
    @Column(name = "specialization", nullable = false)
    private String specialization;

    @Size(max = 100, message = "Le numéro d'immatriculation ne doit pas dépasser 100 caractères")
    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Méthodes utilitaires
    public String getFullName() {
        return firstName + " " + lastName;
    }
}