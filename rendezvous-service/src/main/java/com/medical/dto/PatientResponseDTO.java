package com.medical.dto;

import com.medical.enums.BloodType;
import com.medical.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private int age;
    private Gender gender;
    private String address;
    private String emergencyContact;
    private BloodType bloodType;
    private String bloodTypeDisplay;
    private String allergies;
    private String medicalHistory;
    private LocalDateTime registrationDate;
    private LocalDateTime lastUpdated;
    private Boolean isActive;
}