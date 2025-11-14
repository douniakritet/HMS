package com.doctors.service;
import com.doctors.dto.DoctorDTO;
import com.doctors.dto.DoctorResponseDTO;
import com.doctors.dto.DoctorStatisticsDTO;
import com.doctors.entity.Doctor;
import com.doctors.enums.Gender;
import com.doctors.exception.DoctorAlreadyExistsException;
import com.doctors.exception.DoctorNotFoundException;
import com.doctors.exception.InvalidDoctorDataException;
import com.doctors.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    // ------------------ CREATE ------------------
    public DoctorResponseDTO createDoctor(DoctorDTO doctorDTO) {
        logger.info("Creating new doctor with professional email: {}", doctorDTO.getProfessionalEmail());

        validateDoctorData(doctorDTO);

        if (doctorRepository.findByProfessionalEmail(doctorDTO.getProfessionalEmail()).isPresent()) {
            throw new DoctorAlreadyExistsException("Doctor with email " + doctorDTO.getProfessionalEmail() + " already exists");
        }

        if (doctorRepository.findByPhoneNumber(doctorDTO.getPhoneNumber()).isPresent()) {
            throw new DoctorAlreadyExistsException("Doctor with phone number " + doctorDTO.getPhoneNumber() + " already exists");
        }

        if (doctorRepository.findByRegistrationNumber(doctorDTO.getRegistrationNumber()).isPresent()) {
            throw new DoctorAlreadyExistsException("Doctor with registration number " + doctorDTO.getRegistrationNumber() + " already exists");
        }

        Doctor doctor = convertToEntity(doctorDTO);
        Doctor savedDoctor = doctorRepository.save(doctor);

        logger.info("Doctor created successfully with ID: {}", savedDoctor.getId());
        return convertToResponseDTO(savedDoctor);
    }

    // ------------------ UPDATE ------------------
    public DoctorResponseDTO updateDoctor(Long id, DoctorDTO doctorDTO) {
        logger.info("Updating doctor with ID: {}", id);

        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with ID: " + id));

        validateDoctorData(doctorDTO);

        if (doctorRepository.existsByProfessionalEmailAndIdNot(doctorDTO.getProfessionalEmail(), id)) {
            throw new DoctorAlreadyExistsException("Another doctor with email " + doctorDTO.getProfessionalEmail() + " already exists");
        }

        if (doctorRepository.existsByPhoneNumberAndIdNot(doctorDTO.getPhoneNumber(), id)) {
            throw new DoctorAlreadyExistsException("Another doctor with phone number " + doctorDTO.getPhoneNumber() + " already exists");
        }

        if (doctorRepository.existsByRegistrationNumberAndIdNot(doctorDTO.getRegistrationNumber(), id)) {
            throw new DoctorAlreadyExistsException("Another doctor with registration number " + doctorDTO.getRegistrationNumber() + " already exists");
        }

        updateDoctorFields(existingDoctor, doctorDTO);
        Doctor updatedDoctor = doctorRepository.save(existingDoctor);

        logger.info("Doctor updated successfully with ID: {}", updatedDoctor.getId());
        return convertToResponseDTO(updatedDoctor);
    }

    // ------------------ GET BY ID ------------------
    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with ID: " + id));

        return convertToResponseDTO(doctor);
    }

    // ------------------ GET ALL / SEARCH ------------------
    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> getAllDoctors(Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.findByIsActiveTrue(pageable);
        return doctors.map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> searchDoctors(String searchTerm, Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.searchDoctors(searchTerm, pageable);
        return doctors.map(this::convertToResponseDTO);
    }

    // ------------------ ACTIVER / DESACTIVER ------------------
    public void deactivateDoctor(Long id) {
        logger.info("Deactivating doctor with ID: {}", id);

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with ID: " + id));

        doctor.setIsActive(false);
        doctorRepository.save(doctor);

        logger.info("Doctor deactivated successfully with ID: {}", id);
    }

    public void reactivateDoctor(Long id) {
        logger.info("Reactivating doctor with ID: {}", id);

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with ID: " + id));

        doctor.setIsActive(true);
        doctorRepository.save(doctor);

        logger.info("Doctor reactivated successfully with ID: {}", id);
    }

    // ------------------ STATISTICS ------------------
    @Transactional(readOnly = true)
    public DoctorStatisticsDTO getDoctorStatistics() {
        logger.info("Generating doctor statistics");

        long totalDoctors = doctorRepository.count();
        long activeDoctors = doctorRepository.countByIsActiveTrue();
        long inactiveDoctors = totalDoctors - activeDoctors;

        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime weekStart = today.minusDays(7);
        LocalDateTime monthStart = today.minusDays(30);

        long todayRegistrations = doctorRepository.findByCreatedAtBetween(today, today.plusDays(1)).size();
        long thisWeekRegistrations = doctorRepository.findByCreatedAtBetween(weekStart, LocalDateTime.now()).size();
        long thisMonthRegistrations = doctorRepository.findByCreatedAtBetween(monthStart, LocalDateTime.now()).size();

        // Distribution par spécialité
        Map<String, Long> specializationDistribution = new HashMap<>();
        doctorRepository.findAll().forEach(d -> {
            specializationDistribution.put(d.getSpecialization(),
                    specializationDistribution.getOrDefault(d.getSpecialization(), 0L) + 1);
        });

        // Distribution par genre
        Map<String, Long> genderDistribution = new HashMap<>();
        for (Gender gender : Gender.values()) {
            long count = doctorRepository.countByGender(gender);
            genderDistribution.put(gender.name(), count);
        }

        // Distribution selon expérience (simplifiée, à calculer selon date de création)
        Map<String, Long> experienceLevelDistribution = new HashMap<>();
        experienceLevelDistribution.put("0-5 ans", 0L);
        experienceLevelDistribution.put("6-10 ans", 0L);
        experienceLevelDistribution.put("11-20 ans", 0L);
        experienceLevelDistribution.put("20+ ans", 0L);

        return new DoctorStatisticsDTO(
                totalDoctors,
                activeDoctors,
                inactiveDoctors,
                todayRegistrations,
                thisWeekRegistrations,
                thisMonthRegistrations,
                specializationDistribution,
                genderDistribution,
                experienceLevelDistribution
        );
    }

    // ------------------ VALIDATION ------------------
    private void validateDoctorData(DoctorDTO doctorDTO) {
        if (doctorDTO.getDateOfBirth() != null && doctorDTO.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new InvalidDoctorDataException("Date of birth cannot be in the future");
        }

        int age = Period.between(doctorDTO.getDateOfBirth(), LocalDate.now()).getYears();
        if (age > 100) { // Limite arbitraire
            throw new InvalidDoctorDataException("Invalid date of birth - age cannot exceed 100 years");
        }
    }

    // ------------------ CONVERSION DTO ↔ ENTITY ------------------
    private Doctor convertToEntity(DoctorDTO dto) {
        Doctor doctor = new Doctor();
        updateDoctorFields(doctor, dto);
        return doctor;
    }

    private void updateDoctorFields(Doctor doctor, DoctorDTO dto) {
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setGender(dto.getGender());
        doctor.setDateOfBirth(dto.getDateOfBirth());
        doctor.setPhoneNumber(dto.getPhoneNumber());
        doctor.setProfessionalEmail(dto.getProfessionalEmail());
        doctor.setRegistrationNumber(dto.getRegistrationNumber());
        doctor.setSpecialization(dto.getSpecialization());
    }

    private DoctorResponseDTO convertToResponseDTO(Doctor doctor) {
        DoctorResponseDTO dto = new DoctorResponseDTO();
        dto.setId(doctor.getId());
        dto.setFirstName(doctor.getFirstName());
        dto.setLastName(doctor.getLastName());
        dto.setDateOfBirth(doctor.getDateOfBirth());
        dto.setGender(doctor.getGender());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setProfessionalEmail(doctor.getProfessionalEmail());
        dto.setRegistrationNumber(doctor.getRegistrationNumber());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setIsActive(doctor.getIsActive());
        dto.setCreatedAt(doctor.getCreatedAt());
        dto.setUpdatedAt(doctor.getUpdatedAt());
        return dto;
    }
    public List<DoctorResponseDTO> getDoctorsBySpecialization(String specialization) {
        List<Doctor> doctors = doctorRepository.findBySpecialization(specialization);
        return doctors.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

}
