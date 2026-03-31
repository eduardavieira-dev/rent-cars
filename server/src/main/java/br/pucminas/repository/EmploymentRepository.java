package br.pucminas.repository;

import br.pucminas.model.Employment;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmploymentRepository extends CrudRepository<Employment, UUID> {

    List<Employment> findByClientId(UUID clientId);

    long countByClientId(UUID clientId);
}
