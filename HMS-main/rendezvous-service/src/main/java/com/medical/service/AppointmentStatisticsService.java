package com.medical.service;

import com.medical.dto.AppointmentStatisticsDTO;
import com.medical.entity.RendezVous;
import com.medical.enums.StatusRendezVous;
import com.medical.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentStatisticsService {

    private final RendezVousRepository rendezVousRepository;

    // ✅ Formatter pour convertir LocalDate en String (format de votre BDD)
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public AppointmentStatisticsDTO getStatistics() {
        try {
            log.info("🔍 Début calcul statistiques RDV");

            // Dates pour les calculs (converties en String)
            LocalDate today = LocalDate.now();
            LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
            LocalDate startOfMonth = today.withDayOfMonth(1);

            String todayStr = today.format(DATE_FORMATTER);
            String startOfWeekStr = startOfWeek.format(DATE_FORMATTER);
            String startOfMonthStr = startOfMonth.format(DATE_FORMATTER);

            log.info("📅 Today: {}, StartOfWeek: {}, StartOfMonth: {}", todayStr, startOfWeekStr, startOfMonthStr);

            // Statistiques de base
            Long totalAppointments = rendezVousRepository.count();
            log.info("📊 Total RDV: {}", totalAppointments);

            Long todayAppointments = countSafe(() ->
                    rendezVousRepository.countByDateRendezVous(todayStr), "Today appointments");

            Long thisWeekAppointments = countSafe(() ->
                    rendezVousRepository.countByDateRendezVousBetween(startOfWeekStr, todayStr), "Week appointments");

            Long thisMonthAppointments = countSafe(() ->
                    rendezVousRepository.countByDateRendezVousBetween(startOfMonthStr, todayStr), "Month appointments");

            // Répartition par statut
            Map<String, Long> appointmentsByStatus = getAppointmentsByStatus();

            // Comptages par statut
            Long confirmedCount = countSafe(() ->
                    rendezVousRepository.countByStatus(StatusRendezVous.CONFIRME), "Confirmed");

            Long waitingCount = countSafe(() ->
                    rendezVousRepository.countByStatus(StatusRendezVous.PLANIFIE), "Waiting");

            Long cancelledCount = countSafe(() ->
                    rendezVousRepository.countByStatus(StatusRendezVous.ANNULE), "Cancelled");

            Long completedCount = countSafe(() ->
                    rendezVousRepository.countByStatus(StatusRendezVous.TERMINE), "Completed");

            // Répartition par type
            Map<String, Long> appointmentsByType = getAppointmentsByType();

            // Taux
            Double completionRate = calculateRate(completedCount, totalAppointments);
            Double cancellationRate = calculateRate(cancelledCount, totalAppointments);

            log.info("✅ Statistiques calculées avec succès");

            return AppointmentStatisticsDTO.builder()
                    .totalAppointments(totalAppointments)
                    .todayAppointments(todayAppointments)
                    .thisWeekAppointments(thisWeekAppointments)
                    .thisMonthAppointments(thisMonthAppointments)
                    .appointmentsByStatus(appointmentsByStatus)
                    .appointmentsByType(appointmentsByType)
                    .confirmedCount(confirmedCount)
                    .waitingCount(waitingCount)
                    .cancelledCount(cancelledCount)
                    .completedCount(completedCount)
                    .completionRate(completionRate)
                    .cancellationRate(cancellationRate)
                    .build();

        } catch (Exception e) {
            log.error("❌ Erreur calcul statistiques RDV", e);
            // Retourner des stats vides plutôt qu'une erreur
            return AppointmentStatisticsDTO.builder()
                    .totalAppointments(0L)
                    .todayAppointments(0L)
                    .thisWeekAppointments(0L)
                    .thisMonthAppointments(0L)
                    .appointmentsByStatus(new HashMap<>())
                    .appointmentsByType(new HashMap<>())
                    .confirmedCount(0L)
                    .waitingCount(0L)
                    .cancelledCount(0L)
                    .completedCount(0L)
                    .completionRate(0.0)
                    .cancellationRate(0.0)
                    .build();
        }
    }

    // ✅ Méthode helper pour compter en toute sécurité
    private Long countSafe(java.util.function.Supplier<Long> supplier, String description) {
        try {
            Long result = supplier.get();
            log.info("📊 {}: {}", description, result);
            return result != null ? result : 0L;
        } catch (Exception e) {
            log.error("❌ Erreur comptage {}: {}", description, e.getMessage());
            return 0L;
        }
    }

    private Map<String, Long> getAppointmentsByStatus() {
        try {
            List<RendezVous> appointments = rendezVousRepository.findAll();
            log.info("📋 Nombre total RDV pour stats: {}", appointments.size());

            Map<String, Long> result = appointments.stream()
                    .filter(a -> a.getStatus() != null)
                    .collect(Collectors.groupingBy(
                            a -> a.getStatus().name(),
                            Collectors.counting()
                    ));

            log.info("📊 RDV par statut: {}", result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur getAppointmentsByStatus", e);
            return new HashMap<>();
        }
    }

    private Map<String, Long> getAppointmentsByType() {
        try {
            List<RendezVous> appointments = rendezVousRepository.findAll();

            Map<String, Long> result = appointments.stream()
                    .filter(a -> a.getTypeRendezVous() != null)
                    .collect(Collectors.groupingBy(
                            a -> a.getTypeRendezVous().name(),
                            Collectors.counting()
                    ));

            log.info("📊 RDV par type: {}", result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur getAppointmentsByType", e);
            return new HashMap<>();
        }
    }

    private Double calculateRate(Long count, Long total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        return ((double) count / total) * 100;
    }
}