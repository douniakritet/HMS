package com.doctors.entity;

import com.doctors.enums.BloodType;
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
import java.time.Period;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10-15 digits")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Emergency contact must be between 10-15 digits")
    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type")
    private BloodType bloodType;

    @Size(max = 500, message = "Allergies description must not exceed 500 characters")
    private String allergies;

    @Size(max = 1000, message = "Medical history must not exceed 1000 characters")
    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @CreationTimestamp
    @Column(name = "registration_date", nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public int getAge() {
        if (dateOfBirth == null) return 0;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    public String getBloodTypeDisplay() {
        return bloodType != null ? bloodType.getDisplayName() : "Not specified";
    }
}