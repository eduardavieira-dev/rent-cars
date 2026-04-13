package br.pucminas.model;

import br.pucminas.enums.CreditContractStatus;
import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "credit_contracts")
@Introspected
public class CreditContract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "contract_id", nullable = false, unique = true)
    private Contract contract;

    @Column(name = "interest_rate", nullable = false, precision = 8, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "term_months", nullable = false)
    private int termMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditContractStatus status;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    protected CreditContract() {
    }

    public CreditContract(Contract contract, BigDecimal interestRate, int termMonths) {
        this.contract = contract;
        this.interestRate = interestRate;
        this.termMonths = termMonths;
        this.status = CreditContractStatus.PENDING;
    }

    public UUID getId() {
        return id;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public int getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(int termMonths) {
        this.termMonths = termMonths;
    }

    public CreditContractStatus getStatus() {
        return status;
    }

    public void setStatus(CreditContractStatus status) {
        this.status = status;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }
}
