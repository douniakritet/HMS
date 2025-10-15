/*
package com.medical.integration;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// -------- Appointments --------
@FeignClient(name = "appointmentClient", url = "${clients.appointment}")
public interface AppointmentClient {
    @GetMapping("/api/appointments/by-patient/{pid}")
    List<AppointmentDto> byPatient(@PathVariable("pid") Long pid);
}
public record AppointmentDto(Long id, Long doctorId, String date, String status) {}

// -------- Billing --------
@FeignClient(name = "billingClient", url = "${clients.billing}")
public interface BillingClient {
    @GetMapping("/api/invoices/by-patient/{pid}")
    List<InvoiceDto> byPatient(@PathVariable("pid") Long pid);
}
public record InvoiceDto(Long id, String numero, Double totalTTC, String statut) {}

// -------- Doctors --------
@FeignClient(name = "doctorClient", url = "${clients.doctor}")
public interface DoctorClient {
    @GetMapping("/api/doctors/{id}")
    DoctorDto get(@PathVariable Long id);
}
public record DoctorDto(Long id, String nom, String prenom, String specialite, String email, String telephone) {}
*/
