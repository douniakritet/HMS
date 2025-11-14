package com.doctors.repository;

import com.doctors.entity.Patient;
import com.doctors.enums.BloodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    Optional<Patient> findByEmail(String email);
    
    Optional<Patient> findByPhoneNumber(String phoneNumber);
    
    List<Patient> findByFirstNameAndLastName(String firstName, String lastName);
    
    Page<Patient> findByIsActiveTrue(Pageable pageable);
    
    List<Patient> findByBloodType(BloodType bloodType);
    
    List<Patient> findByRegistrationDateBetween(LocalDateTime start, LocalDateTime end);
    
    long countByIsActiveTrue();
    
    boolean existsByEmailAndIdNot(String email, Long id);
    
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);
    
    @Query("SELECT p FROM Patient p WHERE p.isActive = true AND " +
           "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.phoneNumber LIKE CONCAT('%', :searchTerm, '%'))")
    Page<Patient> searchPatients(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.isActive = true AND p.bloodType = :bloodType")
    long countByBloodType(@Param("bloodType") BloodType bloodType);
}