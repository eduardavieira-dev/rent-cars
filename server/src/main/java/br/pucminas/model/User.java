package br.pucminas.model;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Serdeable
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String email;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}