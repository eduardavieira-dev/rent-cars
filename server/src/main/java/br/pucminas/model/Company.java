package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

@Entity
@Table(name = "companies")
@Introspected
public class Company extends Agent {

    @Column(name = "corporate_name")
    private String corporateName;

    protected Company() {}

    public Company(String name, String email, String phone, String password,
            String cnpj, String corporateName) {
        super(name, email, phone, password, cnpj);
        this.corporateName = corporateName;
    }

    public String getCorporateName() {
        return corporateName;
    }

    public void setCorporateName(String corporateName) {
        this.corporateName = corporateName;
    }
}
