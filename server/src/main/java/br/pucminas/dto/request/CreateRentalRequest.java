package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Serdeable
@Introspected
public record CreateRentalRequest(
        @NotNull UUID vehicleId,
        @NotNull UUID bankId,
        boolean creditRequested) {
}
