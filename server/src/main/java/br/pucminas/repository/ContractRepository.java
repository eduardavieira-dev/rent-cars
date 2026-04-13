package br.pucminas.repository;

import br.pucminas.model.Contract;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends CrudRepository<Contract, UUID> {

    Optional<Contract> findByRentalRequestId(UUID rentalRequestId);

    @Query("SELECT c FROM Contract c WHERE c.rentalRequest.client.id = :clientId")
    List<Contract> findByClientId(UUID clientId);

    @Query("SELECT c FROM Contract c WHERE c.rentalRequest.vehicle.company.id = :companyId")
    List<Contract> findByCompanyId(UUID companyId);

    @Query("SELECT c FROM Contract c WHERE c.rentalRequest.bank.id = :bankId")
    List<Contract> findByBankId(UUID bankId);
}
