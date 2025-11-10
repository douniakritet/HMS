package com.doctors.controller;
import com.doctors.dto.DoctorDTO;
import com.doctors.dto.DoctorResponseDTO;
import com.doctors.dto.DoctorStatisticsDTO;
import com.doctors.service.DoctorService;
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
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class DoctorController {
    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    // ✅ Créer un nouveau médecin
    @PostMapping
    public ResponseEntity<DoctorResponseDTO> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        logger.info("Creating new doctor with email: {}", doctorDTO.getProfessionalEmail());
        DoctorResponseDTO createdDoctor = doctorService.createDoctor(doctorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDoctor);
    }

    // ✅ Lister tous les médecins (pagination)
    @GetMapping
    public ResponseEntity<Page<DoctorResponseDTO>> getAllDoctors(
            @PageableDefault(size = 20, sort = "registrationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        logger.info("Fetching all doctors with pagination: {}", pageable);
        Page<DoctorResponseDTO> doctors = doctorService.getAllDoctors(pageable);
        return ResponseEntity.ok(doctors);
    }

    // ✅ Obtenir un médecin par ID
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable Long id) {
        logger.info("Fetching doctor with ID: {}", id);
        DoctorResponseDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    // ✅ Mettre à jour un médecin
    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        logger.info("Updating doctor with ID: {}", id);
        DoctorResponseDTO updatedDoctor = doctorService.updateDoctor(id, doctorDTO);
        return ResponseEntity.ok(updatedDoctor);
    }

    // ✅ Désactiver un médecin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateDoctor(@PathVariable Long id) {
        logger.info("Deactivating doctor with ID: {}", id);
        doctorService.deactivateDoctor(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Réactiver un médecin
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateDoctor(@PathVariable Long id) {
        logger.info("Reactivating doctor with ID: {}", id);
        doctorService.reactivateDoctor(id);
        return ResponseEntity.ok().build();
    }

    // ✅ Recherche de médecins par nom, spécialité, etc.
    @GetMapping("/search")
    public ResponseEntity<Page<DoctorResponseDTO>> searchDoctors(
            @RequestParam("q") String searchTerm,
            @PageableDefault(size = 20, sort = "registrationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        logger.info("Searching doctors with term: {}", searchTerm);
        Page<DoctorResponseDTO> doctors = doctorService.searchDoctors(searchTerm, pageable);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorResponseDTO>> getDoctorsBySpecialization(@PathVariable String specialization) {
        logger.info("Fetching doctors with specialization: {}", specialization);
        List<DoctorResponseDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(doctors);
    }


    @GetMapping("/statistics")
    public ResponseEntity<DoctorStatisticsDTO> getDoctorStatistics() {
        logger.info("Fetching doctor statistics");
        DoctorStatisticsDTO statistics = doctorService.getDoctorStatistics();
        return ResponseEntity.ok(statistics);
    }

}