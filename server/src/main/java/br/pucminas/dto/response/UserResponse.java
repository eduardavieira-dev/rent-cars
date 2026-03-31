package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String type) {
}
