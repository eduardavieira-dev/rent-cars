package br.pucminas.repository;

import br.pucminas.model.Vehicle;
import br.pucminas.model.VehicleStatus;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends CrudRepository<Vehicle, UUID> {

    boolean existsByRegistrationCode(String registrationCode);

    boolean existsByRegistrationCodeAndIdNot(String registrationCode, UUID id);

    boolean existsByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, UUID id);

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByStatusNot(VehicleStatus status);

    List<Vehicle> findByCompanyId(UUID companyId);
}
