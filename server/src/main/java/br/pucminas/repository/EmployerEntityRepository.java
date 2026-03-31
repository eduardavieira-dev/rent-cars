package br.pucminas.repository;

import br.pucminas.model.EmployerEntity;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.UUID;

@Repository
public interface EmployerEntityRepository extends CrudRepository<EmployerEntity, UUID> {

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, UUID id);
}
