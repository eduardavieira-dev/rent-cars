package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "rental_requests")
@Introspected
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_approval", nullable = false)
    private ApprovalStatus companyApproval;

    @Enumerated(EnumType.STRING)
    @Column(name = "bank_approval", nullable = false)
    private ApprovalStatus bankApproval;

    protected RentalRequest() {
    }

    public RentalRequest(Vehicle vehicle, Client client) {
        this.vehicle = vehicle;
        this.client = client;
        this.companyApproval = ApprovalStatus.PENDING;
        this.bankApproval = ApprovalStatus.PENDING;
    }

    public UUID getId() {
        return id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public ApprovalStatus getCompanyApproval() {
        return companyApproval;
    }

    public void setCompanyApproval(ApprovalStatus companyApproval) {
        this.companyApproval = companyApproval;
    }

    public ApprovalStatus getBankApproval() {
        return bankApproval;
    }

    public void setBankApproval(ApprovalStatus bankApproval) {
        this.bankApproval = bankApproval;
    }
}
