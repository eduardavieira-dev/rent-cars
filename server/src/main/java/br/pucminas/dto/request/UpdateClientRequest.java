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
public record UpdateClientRequest(
                @NotBlank @Size(min = 3, max = 100) @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "must contain only letters and spaces") String name,
                @NotBlank @Email String email,
                @NotBlank @Pattern(regexp = "\\d{11}", message = "must be a valid Brazilian phone number") String phone,
                @NotBlank @Pattern(regexp = "\\d{11}", message = "must be a valid CPF") String cpf,
                @NotBlank @Size(min = 7, max = 20) String rg,
                @Nullable @Size(max = 300) String address,
                @NotBlank @Size(min = 3, max = 100) String profession) {
}
