package br.pucminas.exception;

import java.util.UUID;

public class VehicleOwnershipException extends RuntimeException {
    public VehicleOwnershipException(UUID vehicleId) {
        super("Vehicle does not belong to the authenticated company: " + vehicleId);
    }
}
