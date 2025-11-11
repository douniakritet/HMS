package com.doctors.repository;

import com.doctors.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.doctors.enums.Gender;



@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByProfessionalEmail(String professionalEmail);

    Optional<Doctor> findByPhoneNumber(String phoneNumber);

    Optional<Doctor> findByRegistrationNumber(String registrationNumber);

    Page<Doctor> findByIsActiveTrue(Pageable pageable);

    boolean existsByProfessionalEmailAndIdNot(String professionalEmail, Long id);

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);

    boolean existsByRegistrationNumberAndIdNot(String registrationNumber, Long id);

    List<Doctor> findBySpecialization(String specialization);

    long countByIsActiveTrue();

    List<Doctor> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByGender(Gender gender);


    @Query("SELECT d FROM Doctor d WHERE d.isActive = true AND " +
            "(LOWER(d.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.professionalEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "d.phoneNumber LIKE CONCAT('%', :searchTerm, '%'))")
    Page<Doctor> searchDoctors(@Param("searchTerm") String searchTerm, Pageable pageable);
}
