package br.pucminas.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

import java.util.UUID;

@Serdeable
@Introspected
public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String type,
        @Nullable String cpf,
        @Nullable String rg,
        @Nullable String address,
        @Nullable String profession,
        @Nullable String cnpj,
        @Nullable String code,
        @Nullable String corporateName) {
}
