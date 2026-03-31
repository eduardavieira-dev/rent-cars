package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record EmploymentResponse(
        UUID id,
        Double earnedIncome,
        String jobTitle,
        UUID clientId,
        String clientName,
        UUID employerEntityId,
        String employerEntityName) {
}
