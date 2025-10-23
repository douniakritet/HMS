package com.medical.controller;

import com.medical.dto.PatientDTO;
import com.medical.dto.PatientResponseDTO;
import com.medical.dto.PatientStatisticsDTO;
import com.medical.enums.BloodType;
import com.medical.service.PatientService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @Autowired
    private PatientService patientService;

    @PostMapping
    public ResponseEntity<PatientResponseDTO> createPatient(@Valid @RequestBody PatientDTO patientDTO) {
        logger.info("Creating new patient with email: {}", patientDTO.getEmail());
        PatientResponseDTO createdPatient = patientService.createPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPatient);
    }

    @GetMapping
    public ResponseEntity<Page<PatientResponseDTO>> getAllPatients(
            @PageableDefault(size = 20, sort = "registrationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        logger.info("Fetching all patients with pagination: {}", pageable);
        Page<PatientResponseDTO> patients = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Long id) {
        logger.info("Fetching patient with ID: {}", id);
        PatientResponseDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/cin/{cin}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PatientResponseDTO> getPatientByCin(@PathVariable String cin) {
        logger.info("Fetching patient with CIN: {}", cin);
        PatientResponseDTO patient = patientService.getPatientByCin(cin);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientDTO patientDTO) {
        logger.info("Updating patient with ID: {}", id);
        PatientResponseDTO updatedPatient = patientService.updatePatient(id, patientDTO);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivatePatient(@PathVariable Long id) {
        logger.info("Deactivating patient with ID: {}", id);
        patientService.deactivatePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivatePatient(@PathVariable Long id) {
        logger.info("Reactivating patient with ID: {}", id);
        patientService.reactivatePatient(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientResponseDTO>> searchPatients(
            @RequestParam("q") String searchTerm,
            @PageableDefault(size = 20, sort = "registrationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        logger.info("Searching patients with term: {}", searchTerm);
        Page<PatientResponseDTO> patients = patientService.searchPatients(searchTerm, pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/blood-type/{type}")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsByBloodType(@PathVariable BloodType type) {
        logger.info("Fetching patients with blood type: {}", type);
        List<PatientResponseDTO> patients = patientService.getPatientsByBloodType(type);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/statistics")
    public ResponseEntity<PatientStatisticsDTO> getPatientStatistics() {
        logger.info("Fetching patient statistics");
        PatientStatisticsDTO statistics = patientService.getPatientStatistics();
        return ResponseEntity.ok(statistics);
    }
}