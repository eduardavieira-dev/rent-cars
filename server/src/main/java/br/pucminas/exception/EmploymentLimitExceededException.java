package br.pucminas.exception;

public class EmploymentLimitExceededException extends RuntimeException {
    public EmploymentLimitExceededException(Long clientId) {
        super("Client with id " + clientId + " already has the maximum of 3 employments");
    }
}
