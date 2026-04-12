package br.pucminas.repository;

import br.pucminas.model.RentalRequest;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalRequestRepository extends CrudRepository<RentalRequest, UUID> {

    List<RentalRequest> findByVehicleId(UUID vehicleId);

    List<RentalRequest> findByClientId(UUID clientId);

    List<RentalRequest> findByBankId(UUID bankId);

    List<RentalRequest> findByVehicleCompanyId(UUID companyId);
}
