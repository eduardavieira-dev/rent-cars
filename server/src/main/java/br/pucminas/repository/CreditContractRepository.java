package br.pucminas.repository;

import br.pucminas.model.CreditContract;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditContractRepository extends CrudRepository<CreditContract, UUID> {

    Optional<CreditContract> findByContractId(UUID contractId);

    @Query("SELECT cc FROM CreditContract cc WHERE cc.contract.rentalRequest.bank.id = :bankId")
    List<CreditContract> findByBankId(UUID bankId);

    @Query("SELECT cc FROM CreditContract cc WHERE cc.contract.rentalRequest.client.id = :clientId")
    List<CreditContract> findByClientId(UUID clientId);

    @Query("SELECT cc FROM CreditContract cc WHERE cc.contract.rentalRequest.vehicle.company.id = :companyId")
    List<CreditContract> findByCompanyId(UUID companyId);
}
