package com.medical.patient.service;

import com.medical.patient.api.dto.*;
import com.medical.patient.domain.Patient;
import com.medical.patient.repo.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository repo;

    private Patient toEntity(PatientRequest r){
        return Patient.builder()
                .nom(r.nom())
                .prenom(r.prenom())
                .dateNaissance(r.dateNaissance())
                .sexe(r.sexe())
                .email(r.email())
                .numeroSecuriteSociale(r.numeroSecuriteSociale())
                .adresse(r.adresse())
                .telephone(r.telephone())
                .build();
    }

    private PatientResponse toDto(Patient p){
        return new PatientResponse(
                p.getId(), p.getNom(), p.getPrenom(), p.getDateNaissance(),
                p.getEmail(), p.getNumeroSecuriteSociale(), p.getAdresse(), p.getTelephone(),
                p.getSexe()
        );
    }

    public PatientResponse create(PatientRequest r){ return toDto(repo.save(toEntity(r))); }

    public PatientResponse update(Long id, PatientRequest r){
        var p = repo.findById(id).orElseThrow(() -> new RuntimeException("Patient " + id + " not found"));
        p.setNom(r.nom()); p.setPrenom(r.prenom()); p.setDateNaissance(r.dateNaissance());
        p.setSexe(r.sexe());
        p.setEmail(r.email()); p.setNumeroSecuriteSociale(r.numeroSecuriteSociale());
        p.setAdresse(r.adresse()); p.setTelephone(r.telephone());
        return toDto(repo.save(p));
    }

    public void delete(Long id){ repo.deleteById(id); }

    public PatientResponse get(Long id){
        return repo.findById(id).map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Patient " + id + " not found"));
    }

    public Page<PatientResponse> search(String q, int page, int size){
        var pg = PageRequest.of(page, size, Sort.by("nom").ascending());
        var res = (q == null || q.isBlank()) ? repo.findAll(pg)
                : repo.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q, pg);
        return res.map(this::toDto);
    }
}
