package com.doctors.exception;

public class InvalidPatientDataException extends RuntimeException {
    public InvalidPatientDataException(String message) {
        super(message);
    }
    
    public InvalidPatientDataException(String message, Throwable cause) {
        super(message, cause);
    }
}