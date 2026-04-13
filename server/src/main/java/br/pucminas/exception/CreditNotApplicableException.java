package br.pucminas.exception;

public class CreditNotApplicableException extends RuntimeException {
    public CreditNotApplicableException(String reason) {
        super(reason);
    }
}
