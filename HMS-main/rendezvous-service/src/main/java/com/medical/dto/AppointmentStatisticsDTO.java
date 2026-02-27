package com.medical.dto;

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
public class AppointmentStatisticsDTO {

    @Builder.Default
    private Long totalAppointments = 0L;

    @Builder.Default
    private Long todayAppointments = 0L;

    @Builder.Default
    private Long thisWeekAppointments = 0L;

    @Builder.Default
    private Long thisMonthAppointments = 0L;

    @Builder.Default
    private Map<String, Long> appointmentsByStatus = new HashMap<>();

    @Builder.Default
    private Map<String, Long> appointmentsByType = new HashMap<>();

    @Builder.Default
    private Long confirmedCount = 0L;

    @Builder.Default
    private Long waitingCount = 0L;

    @Builder.Default
    private Long cancelledCount = 0L;

    @Builder.Default
    private Long completedCount = 0L;

    @Builder.Default
    private Double completionRate = 0.0;

    @Builder.Default
    private Double cancellationRate = 0.0;
}