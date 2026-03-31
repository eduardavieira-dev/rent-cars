package br.pucminas.repository;

import br.pucminas.model.User;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends CrudRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);
}
