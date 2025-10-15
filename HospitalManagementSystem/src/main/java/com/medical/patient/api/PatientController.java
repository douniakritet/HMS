package com.medical.patient.api;

import com.medical.patient.api.dto.PatientRequest;
import com.medical.patient.api.dto.PatientResponse;
import com.medical.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients")
public class PatientController {

    private final PatientService service;

    @Operation(summary = "Lister/Rechercher (pagination)")
    @GetMapping   // <-- PAS de "/api/patients" ici, la classe a déjà @RequestMapping("/api/patients")
    public Page<PatientResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.search(q, page, size);
    }

    @Operation(summary = "Créer un patient")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse create(@Valid @RequestBody PatientRequest r) {
        return service.create(r);
    }

    @Operation(summary = "Récupérer un patient par id")
    @GetMapping("/{id}")
    public PatientResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Mettre à jour un patient")
    @PutMapping("/{id}")
    public PatientResponse update(@PathVariable Long id, @Valid @RequestBody PatientRequest r) {
        return service.update(id, r);
    }

    @Operation(summary = "Supprimer un patient")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Si tu réactives l'overview plus tard, ajoute-le ici proprement.


  /*  @Operation(summary="Vue d'ensemble RDV + Factures")
    @GetMapping("/{id}/overview")
    public PatientOverview overview(@PathVariable Long id){
        var patient = service.get(id);
        List<AppointmentDto> rdv = appointmentClient.byPatient(id);
        var invoices = billingClient.byPatient(id);
        return new PatientOverview(patient, rdv, invoices);
    }

    public record PatientOverview(PatientResponse patient, List<AppointmentDto> appointments, List<InvoiceDto> invoices) {}

*/}

