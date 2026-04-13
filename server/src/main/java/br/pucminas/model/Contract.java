package br.pucminas.model;

import br.pucminas.enums.ContractStatus;
import br.pucminas.enums.OwnershipType;
import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contracts")
@Introspected
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "rental_request_id", nullable = false, unique = true)
    private RentalRequest rentalRequest;

    @Column(name = "signature_date", nullable = false)
    private LocalDate signatureDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OwnershipType ownership;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    @Column(name = "terminated_at")
    private LocalDateTime terminatedAt;

    @Column(name = "credit_requested", nullable = false)
    private boolean creditRequested;

    protected Contract() {
    }

    public Contract(RentalRequest rentalRequest, LocalDate signatureDate, BigDecimal value,
            OwnershipType ownership, boolean creditRequested) {
        this.rentalRequest = rentalRequest;
        this.signatureDate = signatureDate;
        this.value = value;
        this.ownership = ownership;
        this.status = ContractStatus.ACTIVE;
        this.creditRequested = creditRequested;
    }

    public UUID getId() {
        return id;
    }

    public RentalRequest getRentalRequest() {
        return rentalRequest;
    }

    public void setRentalRequest(RentalRequest rentalRequest) {
        this.rentalRequest = rentalRequest;
    }

    public LocalDate getSignatureDate() {
        return signatureDate;
    }

    public void setSignatureDate(LocalDate signatureDate) {
        this.signatureDate = signatureDate;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public OwnershipType getOwnership() {
        return ownership;
    }

    public void setOwnership(OwnershipType ownership) {
        this.ownership = ownership;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public LocalDateTime getTerminatedAt() {
        return terminatedAt;
    }

    public void setTerminatedAt(LocalDateTime terminatedAt) {
        this.terminatedAt = terminatedAt;
    }

    public boolean isCreditRequested() {
        return creditRequested;
    }

    public void setCreditRequested(boolean creditRequested) {
        this.creditRequested = creditRequested;
    }
}
