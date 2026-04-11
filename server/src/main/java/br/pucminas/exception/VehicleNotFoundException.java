package br.pucminas.exception;

import java.util.UUID;

public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(UUID id) {
        super("Vehicle not found with id: " + id);
    }
}
