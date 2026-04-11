package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Serdeable
@Introspected
public record UpdateVehicleRequest(
        @NotBlank @Size(max = 50) String registrationCode,
        @NotNull Integer year,
        @NotBlank @Size(max = 50) String brand,
        @NotBlank @Size(max = 50) String model,
        @NotBlank @Size(max = 10) String plate) {
}
