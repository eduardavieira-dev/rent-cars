package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record EmployerEntityResponse(
        Long id,
        String nome,
        String cnpj) {
}
