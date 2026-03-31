package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "employments")
@Introspected
public class Employment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "rendimento_auferido", nullable = false)
    private Double rendimentoAuferido;

    @Column(nullable = false)
    private String cargo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employer_entity_id", nullable = false)
    private EmployerEntity employerEntity;

    protected Employment() {
    }

    public Employment(Double rendimentoAuferido, String cargo, Client client, EmployerEntity employerEntity) {
        this.rendimentoAuferido = rendimentoAuferido;
        this.cargo = cargo;
        this.client = client;
        this.employerEntity = employerEntity;
    }

    public UUID getId() {
        return id;
    }

    public Double getRendimentoAuferido() {
        return rendimentoAuferido;
    }

    public void setRendimentoAuferido(Double rendimentoAuferido) {
        this.rendimentoAuferido = rendimentoAuferido;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public EmployerEntity getEmployerEntity() {
        return employerEntity;
    }

    public void setEmployerEntity(EmployerEntity employerEntity) {
        this.employerEntity = employerEntity;
    }
}
