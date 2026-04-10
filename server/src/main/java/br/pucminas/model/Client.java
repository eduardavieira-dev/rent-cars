package br.pucminas.model;

import io.micronaut.core.annotation.Introspected;
import jakarta.persistence.*;

@Entity
@Table(name = "clients")
@Introspected
public class Client extends User {

    @Column(unique = true)
    private String cpf;

    private String rg;

    private String cep;

    private String address;

    private String profession;

    protected Client() {
    }

    public Client(String name, String email, String phone, String password,
            String cpf, String rg, String cep, String address, String profession) {
        super(name, email, phone, password);
        this.cpf = cpf;
        this.rg = rg;
        this.cep = cep;
        this.address = address;
        this.profession = profession;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }
}
