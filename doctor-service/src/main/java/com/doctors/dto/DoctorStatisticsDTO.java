package com.doctors.dto;
import com.doctors.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorStatisticsDTO {

    private long totalDoctors;
    private long activeDoctors;
    private long inactiveDoctors;
    private long todayRegistrations;
    private long thisWeekRegistrations;
    private long thisMonthRegistrations;
    // Exemple de distribution par spécialité (ex: Cardiologie: 5, Pédiatrie: 4...)
    private Map<String, Long> specializationDistribution;
    // Distribution par genre (Male, Female, Other)
    private Map<String, Long> genderDistribution;
    // Distribution selon l'expérience (ex: 0-5 ans, 6-10 ans, 11-20 ans...)
    private Map<String, Long> experienceLevelDistribution;
}