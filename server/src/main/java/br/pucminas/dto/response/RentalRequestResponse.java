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
                String vehicleBrand,
                UUID clientId,
                String clientName,
                UUID bankId,
                String bankName,
                UUID companyId,
                String companyName,
                String companyApproval,
                String bankApproval) {
}
