package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

@Entity
@Table(name = "agents")
@Introspected
public abstract class Agent extends User {

    @Column(nullable = false, unique = true)
    private String cnpj;

    protected Agent() {}

    protected Agent(String name, String email, String phone, String password, String cnpj) {
        super(name, email, phone, password);
        this.cnpj = cnpj;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }
}
