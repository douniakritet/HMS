package com.doctors.dto;

import com.doctors.enums.BloodType;
import com.doctors.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10-15 digits")
    private String phoneNumber;
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    @NotNull(message = "Gender is required")
    private Gender gender;
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Emergency contact must be between 10-15 digits")
    private String emergencyContact;
    private BloodType bloodType;
    @Size(max = 500, message = "Allergies description must not exceed 500 characters")
    private String allergies;
    @Size(max = 1000, message = "Medical history must not exceed 1000 characters")
    private String medicalHistory;
}