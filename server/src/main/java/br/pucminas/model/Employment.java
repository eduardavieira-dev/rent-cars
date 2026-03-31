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

    @Column(name = "earned_income", nullable = false)
    private Double earnedIncome;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employer_entity_id", nullable = false)
    private EmployerEntity employerEntity;

    public Employment(Double earnedIncome, String jobTitle, Client client, EmployerEntity employerEntity) {
        this.earnedIncome = earnedIncome;
        this.jobTitle = jobTitle;
        this.client = client;
        this.employerEntity = employerEntity;
    }

    public UUID getId() {
        return id;
    }

    public Double getEarnedIncome() {
        return earnedIncome;
    }

    public void setEarnedIncome(Double earnedIncome) {
        this.earnedIncome = earnedIncome;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
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
