package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record EmploymentResponse(
        UUID id,
        Double rendimentoAuferido,
        String cargo,
        UUID clientId,
        String clientName,
        UUID employerEntityId,
        String employerEntityNome) {
}
