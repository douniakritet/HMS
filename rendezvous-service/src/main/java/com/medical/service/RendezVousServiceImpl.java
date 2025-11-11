package com.medical.service;

import com.medical.entity.RendezVous;
import com.medical.repository.RendezVousRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RendezVousServiceImpl implements RendezVousService {

    private final RendezVousRepository repository;

    public RendezVousServiceImpl(RendezVousRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<RendezVous> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<RendezVous> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public RendezVous save(RendezVous rdv) {
        return repository.save(rdv);
    }

    @Override
    public RendezVous update(Long id, RendezVous newRdv) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setDateRendezVous(newRdv.getDateRendezVous());
                    existing.setHeureRdv(newRdv.getHeureRdv());
                    existing.setIdPatient(newRdv.getIdPatient());
                    existing.setIdMedecin(newRdv.getIdMedecin());
                    existing.setStatus(newRdv.getStatus());
                    existing.setNotes(newRdv.getNotes());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
