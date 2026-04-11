package br.pucminas.service;

import br.pucminas.dto.response.RentalRequestResponse;
import br.pucminas.exception.RentalRequestNotFoundException;
import br.pucminas.exception.VehicleNotAvailableException;
import br.pucminas.exception.VehicleNotFoundException;
import br.pucminas.enums.ApprovalStatus;
import br.pucminas.enums.VehicleStatus;
import br.pucminas.model.*;
import br.pucminas.repository.RentalRequestRepository;
import br.pucminas.repository.UserRepository;
import br.pucminas.repository.VehicleRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class RentalRequestService {

    private final RentalRequestRepository rentalRequestRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public RentalRequestService(RentalRequestRepository rentalRequestRepository,
            VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.rentalRequestRepository = rentalRequestRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RentalRequestResponse requestRental(UUID vehicleId, String clientEmail) {
        Client client = resolveClient(clientEmail);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException(vehicleId));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new VehicleNotAvailableException(vehicleId);
        }

        vehicle.setStatus(VehicleStatus.UNDER_REVIEW);
        vehicleRepository.update(vehicle);

        RentalRequest rentalRequest = new RentalRequest(vehicle, client);
        return toResponse(rentalRequestRepository.save(rentalRequest));
    }

    @Transactional
    public RentalRequestResponse approveByCompany(UUID rentalRequestId, boolean approved, String companyEmail) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Company company)) {
            throw new IllegalArgumentException("User is not a Company");
        }

        RentalRequest rentalRequest = rentalRequestRepository.findById(rentalRequestId)
                .orElseThrow(() -> new RentalRequestNotFoundException(rentalRequestId));

        if (!rentalRequest.getVehicle().getCompany().getId().equals(company.getId())) {
            throw new IllegalArgumentException("Rental request does not belong to this company");
        }

        if (!approved) {
            rentalRequest.setCompanyApproval(ApprovalStatus.REJECTED);
            rentalRequest.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.update(rentalRequest.getVehicle());
            return toResponse(rentalRequestRepository.update(rentalRequest));
        }

        rentalRequest.setCompanyApproval(ApprovalStatus.APPROVED);
        checkFullApproval(rentalRequest);
        return toResponse(rentalRequestRepository.update(rentalRequest));
    }

    @Transactional
    public RentalRequestResponse approveByBank(UUID rentalRequestId, boolean approved, String bankEmail) {
        User user = userRepository.findByEmail(bankEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Bank)) {
            throw new IllegalArgumentException("User is not a Bank");
        }

        RentalRequest rentalRequest = rentalRequestRepository.findById(rentalRequestId)
                .orElseThrow(() -> new RentalRequestNotFoundException(rentalRequestId));

        if (!approved) {
            rentalRequest.setBankApproval(ApprovalStatus.REJECTED);
            rentalRequest.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.update(rentalRequest.getVehicle());
            return toResponse(rentalRequestRepository.update(rentalRequest));
        }

        rentalRequest.setBankApproval(ApprovalStatus.APPROVED);
        checkFullApproval(rentalRequest);
        return toResponse(rentalRequestRepository.update(rentalRequest));
    }

    public List<RentalRequestResponse> listAll() {
        return StreamSupport.stream(rentalRequestRepository.findAll().spliterator(), false)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RentalRequestResponse findById(UUID id) {
        RentalRequest rentalRequest = rentalRequestRepository.findById(id)
                .orElseThrow(() -> new RentalRequestNotFoundException(id));
        return toResponse(rentalRequest);
    }

    public List<RentalRequestResponse> listByVehicle(UUID vehicleId) {
        return rentalRequestRepository.findByVehicleId(vehicleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RentalRequestResponse> listByClient(UUID clientId) {
        return rentalRequestRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void checkFullApproval(RentalRequest rentalRequest) {
        if (rentalRequest.getCompanyApproval() == ApprovalStatus.APPROVED
                && rentalRequest.getBankApproval() == ApprovalStatus.APPROVED) {
            rentalRequest.getVehicle().setStatus(VehicleStatus.APPROVED);
            vehicleRepository.update(rentalRequest.getVehicle());
        }
    }

    private Client resolveClient(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Client client)) {
            throw new IllegalArgumentException("User is not a Client");
        }
        return client;
    }

    private RentalRequestResponse toResponse(RentalRequest rentalRequest) {
        return new RentalRequestResponse(
                rentalRequest.getId(),
                rentalRequest.getVehicle().getId(),
                rentalRequest.getVehicle().getPlate(),
                rentalRequest.getVehicle().getModel(),
                rentalRequest.getClient().getId(),
                rentalRequest.getClient().getName(),
                rentalRequest.getCompanyApproval().name(),
                rentalRequest.getBankApproval().name());
    }
}
