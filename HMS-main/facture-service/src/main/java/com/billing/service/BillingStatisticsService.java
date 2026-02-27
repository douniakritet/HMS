package com.billing.service;

import com.billing.dto.BillingStatisticsDTO;
import com.billing.entity.Billing;
import com.billing.entity.Paiement;
import com.billing.enums.BillingStatus;
import com.billing.enums.PaymentMode;
import com.billing.repository.BillingRepository;
import com.billing.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingStatisticsService {

    private final BillingRepository billingRepository;
    private final PaiementRepository paiementRepository;

    public BillingStatisticsDTO getStatistics() {
        try {
            log.info("🔍 Début calcul statistiques facturation");

            // Dates pour les calculs
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
            LocalDateTime startOfWeek = now.minus(7, ChronoUnit.DAYS);
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime lastMonth = now.minus(1, ChronoUnit.MONTHS);
            LocalDateTime startOfLastMonth = lastMonth.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfLastMonth = startOfMonth.minus(1, ChronoUnit.SECONDS);

            log.info("📅 Périodes - Today: {}, Week: {}, Month: {}", startOfDay, startOfWeek, startOfMonth);

            // Statistiques de base
            Long totalInvoices = billingRepository.count();
            log.info("📊 Total factures: {}", totalInvoices);

            // Revenu total
            Double totalRevenue = safeSumDouble(() -> billingRepository.sumAllAmounts(), "Total revenue");

            // Revenus par période
            Double revenueThisMonth = safeSumDouble(() ->
                    billingRepository.sumAmountByCreatedAtAfter(startOfMonth), "Revenue this month");

            Double revenueThisWeek = safeSumDouble(() ->
                    billingRepository.sumAmountByCreatedAtAfter(startOfWeek), "Revenue this week");

            Double revenueToday = safeSumDouble(() ->
                    billingRepository.sumAmountByCreatedAtAfter(startOfDay), "Revenue today");

            Double revenueLastMonth = safeSumDouble(() ->
                    billingRepository.sumAmountByCreatedAtBetween(startOfLastMonth, endOfLastMonth), "Revenue last month");

            // Comptages par statut
            Long paidInvoices = safeCountLong(() ->
                    billingRepository.countByStatus(BillingStatus.PAID), "Paid invoices");

            Long unpaidInvoices = safeCountLong(() ->
                    billingRepository.countByStatus(BillingStatus.UNPAID), "Unpaid invoices");

            Long partiallyPaidInvoices = safeCountLong(() ->
                    billingRepository.countByStatus(BillingStatus.PARTIALLY_PAID), "Partially paid");

            Long cancelledInvoices = safeCountLong(() ->
                    billingRepository.countByStatus(BillingStatus.CANCELLED), "Cancelled invoices");

            // Totaux payés/impayés
            Double totalPaid = safeSumDouble(() ->
                    billingRepository.sumAmountByStatus(BillingStatus.PAID), "Total paid");

            Double totalUnpaid = safeSumDouble(() ->
                    billingRepository.sumAmountByStatus(BillingStatus.UNPAID), "Total unpaid");

            // Répartition par mode de paiement
            Map<String, Long> invoicesByPaymentMode = getInvoicesByPaymentMode();
            Map<String, Double> revenueByPaymentMode = getRevenueByPaymentMode();

            // Taux de paiement
            Double paymentRate = calculatePaymentRate(paidInvoices, totalInvoices);

            // Montant moyen des factures
            Double averageInvoiceAmount = totalInvoices > 0
                    ? totalRevenue / totalInvoices
                    : 0.0;

            // Taux de croissance
            Double growthRate = calculateGrowthRate(revenueThisMonth, revenueLastMonth);

            log.info("✅ Statistiques facturation calculées avec succès");

            return BillingStatisticsDTO.builder()
                    .totalInvoices(totalInvoices)
                    .totalRevenue(totalRevenue)
                    .revenueThisMonth(revenueThisMonth)
                    .revenueThisWeek(revenueThisWeek)
                    .revenueToday(revenueToday)
                    .paidInvoices(paidInvoices)
                    .unpaidInvoices(unpaidInvoices)
                    .partiallyPaidInvoices(partiallyPaidInvoices)
                    .cancelledInvoices(cancelledInvoices)
                    .totalPaid(totalPaid)
                    .totalUnpaid(totalUnpaid)
                    .invoicesByPaymentMode(invoicesByPaymentMode)
                    .revenueByPaymentMode(revenueByPaymentMode)
                    .paymentRate(paymentRate)
                    .averageInvoiceAmount(averageInvoiceAmount)
                    .growthRate(growthRate)
                    .build();

        } catch (Exception e) {
            log.error("❌ Erreur calcul statistiques facturation", e);
            return BillingStatisticsDTO.builder().build();
        }
    }

    // ✅ Helpers pour calculs sécurisés
    private Double safeSumDouble(java.util.function.Supplier<Double> supplier, String description) {
        try {
            Double result = supplier.get();
            result = result != null ? result : 0.0;
            log.info("💰 {}: {}", description, result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur {}: {}", description, e.getMessage());
            return 0.0;
        }
    }

    private Long safeCountLong(java.util.function.Supplier<Long> supplier, String description) {
        try {
            Long result = supplier.get();
            result = result != null ? result : 0L;
            log.info("📊 {}: {}", description, result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur {}: {}", description, e.getMessage());
            return 0L;
        }
    }

    private Map<String, Long> getInvoicesByPaymentMode() {
        try {
            Map<String, Long> result = new HashMap<>();

            // Compter pour chaque mode de paiement
            for (PaymentMode mode : PaymentMode.values()) {
                Long count = paiementRepository.countByModePaiement(mode);
                if (count != null && count > 0) {
                    result.put(mode.name(), count);
                }
            }

            log.info("📊 Factures par mode paiement: {}", result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur getInvoicesByPaymentMode", e);
            return new HashMap<>();
        }
    }

    private Map<String, Double> getRevenueByPaymentMode() {
        try {
            Map<String, Double> result = new HashMap<>();

            // Somme pour chaque mode de paiement
            for (PaymentMode mode : PaymentMode.values()) {
                Double sum = paiementRepository.sumAmountByPaymentMode(mode);
                if (sum != null && sum > 0) {
                    result.put(mode.name(), sum);
                }
            }

            log.info("💰 Revenus par mode paiement: {}", result);
            return result;
        } catch (Exception e) {
            log.error("❌ Erreur getRevenueByPaymentMode", e);
            return new HashMap<>();
        }
    }

    private Double calculatePaymentRate(Long paid, Long total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        return ((double) paid / total) * 100;
    }

    private Double calculateGrowthRate(Double current, Double previous) {
        if (previous == null || previous == 0) {
            return current != null && current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100;
    }
}