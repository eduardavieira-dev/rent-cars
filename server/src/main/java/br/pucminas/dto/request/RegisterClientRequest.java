package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
@Introspected
public record RegisterClientRequest(
        @NotBlank @Size(min = 3, max = 100) String name,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}", message = "must be a valid Brazilian phone number") String phone,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotBlank @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "must be a valid CPF") String cpf,
        @Nullable @Size(min = 5, max = 20) String rg,
        @Nullable @Size(max = 200) String address,
        @Nullable @Size(max = 100) String profession) {
}
