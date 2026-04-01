package br.pucminas.repository;

import br.pucminas.model.Client;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.UUID;

@Repository
public interface ClientRepository extends CrudRepository<Client, UUID> {
    boolean existsByCpf(String cpf);
}
