package com.doctors.service;

import com.doctors.dto.DoctorStatisticsDTO;
import com.doctors.entity.Doctor;
import com.doctors.enums.Gender;
import com.doctors.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorStatisticsService {

    private final DoctorRepository doctorRepository;

    public DoctorStatisticsDTO getStatistics() {
        // Dates pour les calculs
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        // Statistiques de base
        Long totalDoctors = doctorRepository.count();
        Long activeDoctors = doctorRepository.countByIsActiveTrue();
        Long inactiveDoctors = totalDoctors - activeDoctors;

        // Nouveaux médecins ce mois
        Long newThisMonth = doctorRepository.countByCreatedAtAfter(startOfMonth);

        // Répartition par spécialisation
        Map<String, Long> doctorsBySpecialization = getDoctorsBySpecialization();

        // Âge moyen
        Integer averageAge = calculateAverageAge();

        // Répartition par genre (CORRECTION ICI)
        Long maleCount = doctorRepository.countByGender(Gender.MALE);
        Long femaleCount = doctorRepository.countByGender(Gender.FEMALE);

        return DoctorStatisticsDTO.builder()
                .totalDoctors(totalDoctors)
                .activeDoctors(activeDoctors)
                .inactiveDoctors(inactiveDoctors)
                .newThisMonth(newThisMonth)
                .doctorsBySpecialization(doctorsBySpecialization)
                .averageAge(averageAge)
                .maleCount(maleCount)
                .femaleCount(femaleCount)
                .build();
    }

    private Map<String, Long> getDoctorsBySpecialization() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors.stream()
                .filter(d -> d.getSpecialization() != null)
                .collect(Collectors.groupingBy(
                        Doctor::getSpecialization,
                        Collectors.counting()
                ));
    }

    private Integer calculateAverageAge() {
        List<Doctor> doctors = doctorRepository.findAll();
        if (doctors.isEmpty()) {
            return 0;
        }

        int totalAge = doctors.stream()
                .filter(d -> d.getDateOfBirth() != null)
                .mapToInt(d -> Period.between(d.getDateOfBirth(), LocalDate.now()).getYears())
                .sum();

        long count = doctors.stream()
                .filter(d -> d.getDateOfBirth() != null)
                .count();

        return count > 0 ? (int) (totalAge / count) : 0;
    }
}