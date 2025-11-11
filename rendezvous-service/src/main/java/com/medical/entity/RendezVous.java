package com.medical.entity;

import jakarta.persistence.*;
import lombok.*;
import com.medical.enums.StatusRendezVous;
import com.medical.enums.TypeRendezVous;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rendez_vous")
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRendezVous;

    private String dateRendezVous;
    private String heureRdv;

    private Long idPatient;
    private Long idMedecin;

    @Enumerated(EnumType.STRING)
    private StatusRendezVous status;

    private String notes;
    @Enumerated(EnumType.STRING)
    private TypeRendezVous typeRendezVous;
}
