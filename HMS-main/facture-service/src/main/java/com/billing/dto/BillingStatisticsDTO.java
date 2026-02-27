package com.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingStatisticsDTO {

    @Builder.Default
    private Long totalInvoices = 0L;

    @Builder.Default
    private Double totalRevenue = 0.0;

    @Builder.Default
    private Double revenueThisMonth = 0.0;

    @Builder.Default
    private Double revenueThisWeek = 0.0;

    @Builder.Default
    private Double revenueToday = 0.0;

    @Builder.Default
    private Long paidInvoices = 0L;

    @Builder.Default
    private Long unpaidInvoices = 0L;

    @Builder.Default
    private Long partiallyPaidInvoices = 0L;

    @Builder.Default
    private Long cancelledInvoices = 0L;

    @Builder.Default
    private Double totalPaid = 0.0;

    @Builder.Default
    private Double totalUnpaid = 0.0;

    @Builder.Default
    private Map<String, Long> invoicesByPaymentMode = new HashMap<>();

    @Builder.Default
    private Map<String, Double> revenueByPaymentMode = new HashMap<>();

    @Builder.Default
    private Double paymentRate = 0.0;

    @Builder.Default
    private Double averageInvoiceAmount = 0.0;

    @Builder.Default
    private Double growthRate = 0.0;
}