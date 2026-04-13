package br.pucminas.exception;

public class ContractNotEligibleException extends RuntimeException {
    public ContractNotEligibleException(String reason) {
        super(reason);
    }
}
