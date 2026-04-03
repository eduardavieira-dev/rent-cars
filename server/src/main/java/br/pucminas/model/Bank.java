package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

@Entity
@Table(name = "banks")
@Introspected
public class Bank extends Agent {

    @Column(name = "bank_code", unique = true)
    private String code;

    protected Bank() {}

    public Bank(String name, String email, String phone, String password,
            String cnpj, String code) {
        super(name, email, phone, password, cnpj);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
