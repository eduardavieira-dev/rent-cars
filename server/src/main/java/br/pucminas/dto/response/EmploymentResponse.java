package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record EmploymentResponse(
        Long id,
        Double rendimentoAuferido,
        String cargo,
        Long clientId,
        String clientName,
        Long employerEntityId,
        String employerEntityNome) {
}
