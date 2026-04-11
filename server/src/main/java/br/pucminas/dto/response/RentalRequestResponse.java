package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record RentalRequestResponse(
        UUID id,
        UUID vehicleId,
        String vehiclePlate,
        String vehicleModel,
        UUID clientId,
        String clientName,
        String companyApproval,
        String bankApproval) {
}
