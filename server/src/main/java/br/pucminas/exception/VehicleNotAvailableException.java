package br.pucminas.exception;

import java.util.UUID;

public class VehicleNotAvailableException extends RuntimeException {
    public VehicleNotAvailableException(UUID id) {
        super("Vehicle with id " + id + " is not available for rental");
    }
}
