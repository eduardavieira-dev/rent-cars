package br.pucminas.exception;

import java.util.UUID;

public class EmployerEntityNotFoundException extends RuntimeException {
    public EmployerEntityNotFoundException(UUID id) {
        super("Employer entity not found with id: " + id);
    }
}
