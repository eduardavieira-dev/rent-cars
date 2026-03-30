package br.pucminas.exception;

public class CnpjAlreadyExistsException extends RuntimeException {
    public CnpjAlreadyExistsException(String cnpj) {
        super("CNPJ already registered: " + cnpj);
    }
}
