package br.pucminas.exception;

public class EmployerEntityNotFoundException extends RuntimeException {
    public EmployerEntityNotFoundException(Long id) {
        super("Employer entity not found with id: " + id);
    }
}
