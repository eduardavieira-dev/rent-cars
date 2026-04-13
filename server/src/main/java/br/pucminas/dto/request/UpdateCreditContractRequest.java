package br.pucminas.dto.request;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

@Serdeable
@Introspected
public record UpdateCreditContractRequest(
        @NotNull @PositiveOrZero BigDecimal interestRate,
        @Positive int termMonths) {
}
