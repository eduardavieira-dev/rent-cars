package br.pucminas.dto.response;

import br.pucminas.enums.CreditContractStatus;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Serdeable
@Introspected
public record CreditContractResponse(
                UUID id,
                UUID contractId,
                UUID bankId,
                String bankName,
                BigDecimal interestRate,
                int termMonths,
                CreditContractStatus status,
                LocalDateTime approvedAt,
                LocalDateTime grantedAt) {
}
