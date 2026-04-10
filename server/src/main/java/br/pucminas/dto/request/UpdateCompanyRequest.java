package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
@Introspected
public record UpdateCompanyRequest(
                @NotBlank @Size(min = 3, max = 100) @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "must contain only letters and spaces") String name,
                @NotBlank @Email String email,
                @NotBlank @Pattern(regexp = "\\d{11}", message = "must be a valid Brazilian phone number") String phone,
                @NotBlank @Pattern(regexp = "\\d{14}", message = "must be a valid CNPJ") String cnpj,
                @NotBlank @Size(min = 3, max = 200) String corporateName) {
}
