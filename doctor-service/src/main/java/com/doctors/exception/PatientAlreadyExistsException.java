package com.doctors.exception;

public class PatientAlreadyExistsException extends RuntimeException {
    public PatientAlreadyExistsException(String message) {
        super(message);
    }
    
    public PatientAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}