package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record VehicleResponse(
        UUID id,
        String registrationCode,
        Integer year,
        String brand,
        String model,
        String plate,
        @Nullable String imageUrl,
        String status,
        UUID companyId,
        String companyName) {
}
