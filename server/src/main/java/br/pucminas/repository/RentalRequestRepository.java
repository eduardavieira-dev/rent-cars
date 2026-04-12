package br.pucminas.repository;

import br.pucminas.model.RentalRequest;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalRequestRepository extends CrudRepository<RentalRequest, UUID> {

    List<RentalRequest> findByVehicleId(UUID vehicleId);

    @Query("SELECT rr FROM RentalRequest rr WHERE rr.client.id = :clientId")
    List<RentalRequest> findByClientId(UUID clientId);

    @Query("SELECT rr FROM RentalRequest rr WHERE rr.bank.id = :bankId")
    List<RentalRequest> findByBankId(UUID bankId);

    @Query("SELECT rr FROM RentalRequest rr WHERE rr.vehicle.company.id = :companyId")
    List<RentalRequest> findByVehicleCompanyId(UUID companyId);
}
