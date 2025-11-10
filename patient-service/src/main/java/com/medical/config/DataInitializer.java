package com.medical.config;

import com.medical.entity.Admin;
import com.medical.enums.Role;
import com.medical.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        createDefaultAdmin();
    }
    
    private void createDefaultAdmin() {
        if (!adminRepository.existsByUsername("admin")) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setEmail("admin@hospital.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Patients");
            admin.setLastName("Administrator");
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            
            adminRepository.save(admin);
            logger.info("Default admin user created - Username: admin, Password: admin123");
        } else {
            logger.info("Default admin user already exists");
        }
    }
}