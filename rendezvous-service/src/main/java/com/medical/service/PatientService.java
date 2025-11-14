package com.medical.service;

import com.medical.dto.PatientDTO;
import com.medical.dto.PatientResponseDTO;
import com.medical.dto.PatientStatisticsDTO;
import com.medical.entity.Patient;
import com.medical.enums.BloodType;
import com.medical.enums.Gender;
import com.medical.exception.InvalidPatientDataException;
import com.medical.exception.PatientAlreadyExistsException;
import com.medical.exception.PatientNotFoundException;
import com.medical.repository.PatientRepository;
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {
    
    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);
    
    @Autowired
    private PatientRepository patientRepository;
    
    public PatientResponseDTO createPatient(PatientDTO patientDTO) {
        logger.info("Creating new patient with email: {}", patientDTO.getEmail());
        
        // Validate patient data
        validatePatientData(patientDTO);
        
        // Check if patient already exists
        if (patientRepository.findByEmail(patientDTO.getEmail()).isPresent()) {
            throw new PatientAlreadyExistsException("Patient with email " + patientDTO.getEmail() + " already exists");
        }
        
        if (patientRepository.findByPhoneNumber(patientDTO.getPhoneNumber()).isPresent()) {
            throw new PatientAlreadyExistsException("Patient with phone number " + patientDTO.getPhoneNumber() + " already exists");
        }
        
        // Create and save patient
        Patient patient = convertToEntity(patientDTO);
        Patient savedPatient = patientRepository.save(patient);
        
        logger.info("Patient created successfully with ID: {}", savedPatient.getId());
        return convertToResponseDTO(savedPatient);
    }
    
    public PatientResponseDTO updatePatient(Long id, PatientDTO patientDTO) {
        logger.info("Updating patient with ID: {}", id);
        
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        // Validate patient data
        validatePatientData(patientDTO);
        
        // Check for duplicate email (excluding current patient)
        if (patientRepository.existsByEmailAndIdNot(patientDTO.getEmail(), id)) {
            throw new PatientAlreadyExistsException("Another patient with email " + patientDTO.getEmail() + " already exists");
        }
        
        // Check for duplicate phone number (excluding current patient)
        if (patientRepository.existsByPhoneNumberAndIdNot(patientDTO.getPhoneNumber(), id)) {
            throw new PatientAlreadyExistsException("Another patient with phone number " + patientDTO.getPhoneNumber() + " already exists");
        }
        
        // Update patient fields
        updatePatientFields(existingPatient, patientDTO);
        Patient updatedPatient = patientRepository.save(existingPatient);
        
        logger.info("Patient updated successfully with ID: {}", updatedPatient.getId());
        return convertToResponseDTO(updatedPatient);
    }
    
    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        return convertToResponseDTO(patient);
    }
    
    @Transactional(readOnly = true)
    public Page<PatientResponseDTO> getAllPatients(Pageable pageable) {
        Page<Patient> patients = patientRepository.findByIsActiveTrue(pageable);
        return patients.map(this::convertToResponseDTO);
    }
    
    @Transactional(readOnly = true)
    public Page<PatientResponseDTO> searchPatients(String searchTerm, Pageable pageable) {
        Page<Patient> patients = patientRepository.searchPatients(searchTerm, pageable);
        return patients.map(this::convertToResponseDTO);
    }
    
    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getPatientsByBloodType(BloodType bloodType) {
        List<Patient> patients = patientRepository.findByBloodType(bloodType);
        return patients.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public void deactivatePatient(Long id) {
        logger.info("Deactivating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        patient.setIsActive(false);
        patientRepository.save(patient);
        
        logger.info("Patient deactivated successfully with ID: {}", id);
    }
    
    public void reactivatePatient(Long id) {
        logger.info("Reactivating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        patient.setIsActive(true);
        patientRepository.save(patient);
        
        logger.info("Patient reactivated successfully with ID: {}", id);
    }
    
    @Transactional(readOnly = true)
    public PatientStatisticsDTO getPatientStatistics() {
        logger.info("Generating patient statistics");
        
        long totalPatients = patientRepository.count();
        long activePatients = patientRepository.countByIsActiveTrue();
        long inactivePatients = totalPatients - activePatients;
        
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime weekStart = today.minusDays(7);
        LocalDateTime monthStart = today.minusDays(30);
        
        long todayRegistrations = patientRepository.findByRegistrationDateBetween(today, today.plusDays(1)).size();
        long thisWeekRegistrations = patientRepository.findByRegistrationDateBetween(weekStart, LocalDateTime.now()).size();
        long thisMonthRegistrations = patientRepository.findByRegistrationDateBetween(monthStart, LocalDateTime.now()).size();
        
        // Blood type distribution
        Map<BloodType, Long> bloodTypeDistribution = new HashMap<>();
        for (BloodType bloodType : BloodType.values()) {
            long count = patientRepository.countByBloodType(bloodType);
            bloodTypeDistribution.put(bloodType, count);
        }
        
        // Gender distribution (simplified - would need custom query for actual implementation)
        Map<String, Long> genderDistribution = new HashMap<>();
        genderDistribution.put("MALE", 0L);
        genderDistribution.put("FEMALE", 0L);
        genderDistribution.put("OTHER", 0L);
        
        // Age group distribution (simplified - would need custom query for actual implementation)
        Map<String, Long> ageGroupDistribution = new HashMap<>();
        ageGroupDistribution.put("0-18", 0L);
        ageGroupDistribution.put("19-30", 0L);
        ageGroupDistribution.put("31-50", 0L);
        ageGroupDistribution.put("51-70", 0L);
        ageGroupDistribution.put("70+", 0L);
        
        return new PatientStatisticsDTO(
                totalPatients,
                activePatients,
                inactivePatients,
                todayRegistrations,
                thisWeekRegistrations,
                thisMonthRegistrations,
                bloodTypeDistribution,
                genderDistribution,
                ageGroupDistribution
        );
    }
    
    private void validatePatientData(PatientDTO patientDTO) {
        if (patientDTO.getDateOfBirth() != null && patientDTO.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new InvalidPatientDataException("Date of birth cannot be in the future");
        }
        
        if (patientDTO.getDateOfBirth() != null) {
            int age = Period.between(patientDTO.getDateOfBirth(), LocalDate.now()).getYears();
            if (age > 150) {
                throw new InvalidPatientDataException("Invalid date of birth - age cannot exceed 150 years");
            }
        }
        
        if (patientDTO.getEmail() != null && !patientDTO.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidPatientDataException("Invalid email format");
        }
    }
    
    private Patient convertToEntity(PatientDTO dto) {
        Patient patient = new Patient();
        updatePatientFields(patient, dto);
        return patient;
    }
    
    private void updatePatientFields(Patient patient, PatientDTO dto) {
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setEmail(dto.getEmail());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setAddress(dto.getAddress());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setBloodType(dto.getBloodType());
        patient.setAllergies(dto.getAllergies());
        patient.setMedicalHistory(dto.getMedicalHistory());
    }
    
    private PatientResponseDTO convertToResponseDTO(Patient patient) {
        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setId(patient.getId());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setFullName(patient.getFullName());
        dto.setEmail(patient.getEmail());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setAddress(patient.getAddress());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setBloodType(patient.getBloodType());
        dto.setBloodTypeDisplay(patient.getBloodTypeDisplay());
        dto.setAllergies(patient.getAllergies());
        dto.setMedicalHistory(patient.getMedicalHistory());
        dto.setRegistrationDate(patient.getRegistrationDate());
        dto.setLastUpdated(patient.getLastUpdated());
        dto.setIsActive(patient.getIsActive());
        return dto;
    }
}