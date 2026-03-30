package br.pucminas.repository;

import br.pucminas.model.Employment;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;

@Repository
public interface EmploymentRepository extends CrudRepository<Employment, Long> {

    List<Employment> findByClientId(Long clientId);

    long countByClientId(Long clientId);
}
