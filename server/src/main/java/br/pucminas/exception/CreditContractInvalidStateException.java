package br.pucminas.exception;

public class CreditContractInvalidStateException extends RuntimeException {
    public CreditContractInvalidStateException(String reason) {
        super(reason);
    }
}
