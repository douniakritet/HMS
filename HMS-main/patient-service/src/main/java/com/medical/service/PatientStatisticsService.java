package com.medical.patient.service;

import com.medical.dto.PatientStatisticsDTO;
import com.medical.entity.Patient;
import com.medical.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientStatisticsService {

    private final PatientRepository patientRepository;

    public PatientStatisticsDTO getStatistics() {
        // Dates pour les calculs
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime lastMonth = now.minus(1, ChronoUnit.MONTHS);
        LocalDateTime startOfLastMonth = lastMonth.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfLastMonth = startOfMonth.minus(1, ChronoUnit.SECONDS);

        // Statistiques de base
        Long totalPatients = patientRepository.count();
        Long activePatients = patientRepository.countByIsActiveTrue();
        Long inactivePatients = totalPatients - activePatients;

        // Nouveaux patients
        Long newThisMonth = patientRepository.countByRegistrationDateAfter(startOfMonth);
        Long newThisWeek = patientRepository.countByRegistrationDateAfter(startOfWeek);
        Long newLastMonth = patientRepository.countByRegistrationDateBetween(startOfLastMonth, endOfLastMonth);

        // Taux de croissance
        Double growthRate = calculateGrowthRate(newThisMonth, newLastMonth);

        // Âge moyen
        Integer averageAge = calculateAverageAge();

        // Répartition par genre
        Long maleCount = patientRepository.countByGender(Patient.Gender.MALE);
        Long femaleCount = patientRepository.countByGender(Patient.Gender.FEMALE);

        return PatientStatisticsDTO.builder()
                .totalPatients(totalPatients)
                .activePatients(activePatients)
                .inactivePatients(inactivePatients)
                .newThisMonth(newThisMonth)
                .newThisWeek(newThisWeek)
                .growthRate(growthRate)
                .averageAge(averageAge)
                .maleCount(maleCount)
                .femaleCount(femaleCount)
                .build();
    }

    private Double calculateGrowthRate(Long currentMonth, Long lastMonth) {
        if (lastMonth == null || lastMonth == 0) {
            return currentMonth > 0 ? 100.0 : 0.0;
        }
        return ((double) (currentMonth - lastMonth) / lastMonth) * 100;
    }

    private Integer calculateAverageAge() {
        List<Patient> patients = patientRepository.findAll();
        if (patients.isEmpty()) {
            return 0;
        }

        int totalAge = patients.stream()
                .filter(p -> p.getDateOfBirth() != null)
                .mapToInt(p -> Period.between(p.getDateOfBirth(), LocalDate.now()).getYears())
                .sum();

        long count = patients.stream()
                .filter(p -> p.getDateOfBirth() != null)
                .count();

        return count > 0 ? (int) (totalAge / count) : 0;
    }
}