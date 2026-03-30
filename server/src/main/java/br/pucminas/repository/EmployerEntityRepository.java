package br.pucminas.repository;

import br.pucminas.model.EmployerEntity;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface EmployerEntityRepository extends CrudRepository<EmployerEntity, Long> {

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, Long id);
}
