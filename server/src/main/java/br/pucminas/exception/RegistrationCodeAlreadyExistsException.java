package br.pucminas.exception;

public class RegistrationCodeAlreadyExistsException extends RuntimeException {
    public RegistrationCodeAlreadyExistsException(String registrationCode) {
        super("Registration code already registered: " + registrationCode);
    }
}
