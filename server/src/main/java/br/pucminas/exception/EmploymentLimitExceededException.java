package br.pucminas.exception;

import java.util.UUID;

public class EmploymentLimitExceededException extends RuntimeException {
    public EmploymentLimitExceededException(UUID clientId) {
        super("Client with id " + clientId + " already has the maximum of 3 employments");
    }
}
