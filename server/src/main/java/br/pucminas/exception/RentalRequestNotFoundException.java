package br.pucminas.exception;

import java.util.UUID;

public class RentalRequestNotFoundException extends RuntimeException {
    public RentalRequestNotFoundException(UUID id) {
        super("Rental request not found with id: " + id);
    }
}
