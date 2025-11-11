package com.medical.service;

import com.medical.entity.RendezVous;

import java.util.List;
import java.util.Optional;

public interface RendezVousService {
    List<RendezVous> getAll();
    Optional<RendezVous> getById(Long id);
    RendezVous save(RendezVous rdv);
    RendezVous update(Long id, RendezVous rdv);
    void delete(Long id);
}
