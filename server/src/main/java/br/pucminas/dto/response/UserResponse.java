package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        String type) {
}
