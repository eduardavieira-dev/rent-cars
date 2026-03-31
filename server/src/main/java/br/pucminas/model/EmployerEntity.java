package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "employer_entities")
@Introspected
public class EmployerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String cnpj;

    protected EmployerEntity() {
    }

    public EmployerEntity(String nome, String cnpj) {
        this.nome = nome;
        this.cnpj = cnpj;
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }
}
