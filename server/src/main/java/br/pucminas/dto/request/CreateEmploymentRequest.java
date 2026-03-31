package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Serdeable
@Introspected
public record CreateEmploymentRequest(
        @NotNull @Positive Double earnedIncome,
        @NotBlank @Size(min = 2, max = 100) String jobTitle,
        @NotNull UUID clientId,
        @NotNull UUID employerEntityId) {
}
