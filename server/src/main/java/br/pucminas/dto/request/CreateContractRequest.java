package br.pucminas.dto.request;

import br.pucminas.enums.OwnershipType;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Serdeable
@Introspected
public record CreateContractRequest(
        @NotNull UUID rentalRequestId,
        @NotNull LocalDate signatureDate,
        @NotNull @Positive BigDecimal value,
        @NotNull OwnershipType ownership) {
}
