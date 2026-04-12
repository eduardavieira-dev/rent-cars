package br.pucminas.repository;

import br.pucminas.model.Company;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends CrudRepository<Company, UUID> {
    Optional<Company> findByEmail(String email);
}
