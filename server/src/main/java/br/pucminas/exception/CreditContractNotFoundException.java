package br.pucminas.exception;

import java.util.UUID;

public class CreditContractNotFoundException extends RuntimeException {
    public CreditContractNotFoundException(UUID id) {
        super("Credit contract not found with id: " + id);
    }
}
