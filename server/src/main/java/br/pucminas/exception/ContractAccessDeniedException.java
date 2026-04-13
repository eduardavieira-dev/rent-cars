package br.pucminas.exception;

public class ContractAccessDeniedException extends RuntimeException {
    public ContractAccessDeniedException() {
        super("Current user is not allowed to access this contract");
    }

    public ContractAccessDeniedException(String message) {
        super(message);
    }
}
