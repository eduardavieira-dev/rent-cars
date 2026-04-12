package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Serdeable
@Introspected
public record CreateVehicleRequest(
                @NotBlank @Size(max = 50) String registrationCode,
                @NotNull Integer year,
                @NotBlank @Size(max = 50) String brand,
                @NotBlank @Size(max = 50) String model,
                @NotBlank @Size(max = 10) String plate,
                @Nullable @Size(max = 500) String description,
                @Nullable BigDecimal dailyRate) {
}
