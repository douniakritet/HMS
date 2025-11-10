package com.doctors.controller;

import com.doctors.dto.LoginRequest;
import com.doctors.dto.LoginResponse;
import com.doctors.entity.Admin;
import com.doctors.service.AdminService;
import com.doctors.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for username: {}", loginRequest.getUsername());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateToken(authentication);
            
            Admin admin = adminService.findByUsername(loginRequest.getUsername());
            
            LoginResponse response = new LoginResponse(
                jwt,
                admin.getId(),
                admin.getUsername(),
                admin.getEmail(),
                admin.getFullName(),
                admin.getRole().name()
            );
            
            logger.info("User {} logged in successfully", loginRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException ex) {
            logger.error("Failed login attempt for username: {}", loginRequest.getUsername());
            throw ex;
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("User logged out successfully!");
    }
    
    @GetMapping("/me")
    public ResponseEntity<Admin> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                logger.warn("No authenticated user found");
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            logger.info("Getting current user info for: {}", username);
            
            Admin admin = adminService.findByUsername(username);
            if (admin == null) {
                logger.error("Admin not found for username: {}", username);
                return ResponseEntity.notFound().build();
            }
            
            // Clear password before sending response
            admin.setPassword(null);
            
            return ResponseEntity.ok(admin);
            
        } catch (Exception ex) {
            logger.error("Error getting current user: ", ex);
            return ResponseEntity.status(500).build();
        }
    }
}