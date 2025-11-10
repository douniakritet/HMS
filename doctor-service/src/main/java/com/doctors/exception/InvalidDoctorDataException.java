package com.doctors.exception;

public class InvalidDoctorDataException extends RuntimeException {
    public InvalidDoctorDataException(String message) {
        super(message);
    }

    public InvalidDoctorDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
