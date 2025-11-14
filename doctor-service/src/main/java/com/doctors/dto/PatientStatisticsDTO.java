package com.doctors.dto;

import com.doctors.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientStatisticsDTO {
    
    private long totalPatients;
    private long activePatients;
    private long inactivePatients;
    private long todayRegistrations;
    private long thisWeekRegistrations;
    private long thisMonthRegistrations;
    private Map<BloodType, Long> bloodTypeDistribution;
    private Map<String, Long> genderDistribution;
    private Map<String, Long> ageGroupDistribution;
}