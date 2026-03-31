package br.pucminas.exception;

import java.util.UUID;

public class EmploymentNotFoundException extends RuntimeException {
    public EmploymentNotFoundException(UUID id) {
        super("Employment not found with id: " + id);
    }
}
