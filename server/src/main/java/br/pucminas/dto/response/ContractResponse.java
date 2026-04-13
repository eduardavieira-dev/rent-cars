package br.pucminas.dto.response;

import br.pucminas.enums.ContractStatus;
import br.pucminas.enums.OwnershipType;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Serdeable
@Introspected
public record ContractResponse(
                UUID id,
                UUID rentalRequestId,
                UUID vehicleId,
                String vehiclePlate,
                String vehicleModel,
                String vehicleBrand,
                UUID clientId,
                String clientName,
                UUID companyId,
                String companyName,
                UUID bankId,
                String bankName,
                LocalDate signatureDate,
                BigDecimal value,
                OwnershipType ownership,
                ContractStatus status,
                LocalDateTime terminatedAt,
                boolean creditRequested,
                UUID creditContractId) {
}
