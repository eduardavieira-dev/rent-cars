package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
@Introspected
public record UpdateEmployerEntityRequest(
        @NotBlank @Size(min = 2, max = 150) String nome,
        @NotBlank @Pattern(regexp = "\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}", message = "must be a valid CNPJ") String cnpj) {
}
