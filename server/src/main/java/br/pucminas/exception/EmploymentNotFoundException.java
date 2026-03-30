package br.pucminas.exception;

public class EmploymentNotFoundException extends RuntimeException {
    public EmploymentNotFoundException(Long id) {
        super("Employment not found with id: " + id);
    }
}
