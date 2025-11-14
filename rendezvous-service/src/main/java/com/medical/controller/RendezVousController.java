package com.medical.controller;

import com.medical.entity.RendezVous;
import com.medical.service.RendezVousService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rendezvous")
@CrossOrigin(origins = {"http://localhost:5176", "http://localhost:8083", "http://localhost:3000", "http://localhost:5173", "*"})
public class RendezVousController {

    private final RendezVousService service;

    public RendezVousController(RendezVousService service) {
        this.service = service;
    }

    @GetMapping
    public List<RendezVous> getAll() {
        return service.getAll();
    }

    @PostMapping
    public RendezVous create(@RequestBody RendezVous rdv) {
        return service.save(rdv);
    }

    @PutMapping("/{id}")
    public RendezVous update(@PathVariable Long id, @RequestBody RendezVous rdv) {
        return service.update(id, rdv);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
