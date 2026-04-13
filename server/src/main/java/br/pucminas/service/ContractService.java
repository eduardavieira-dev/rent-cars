package br.pucminas.service;

import br.pucminas.dto.request.CreateContractRequest;
import br.pucminas.dto.request.UpdateContractRequest;
import br.pucminas.dto.response.ContractResponse;
import br.pucminas.enums.ApprovalStatus;
import br.pucminas.enums.ContractStatus;
import br.pucminas.enums.CreditContractStatus;
import br.pucminas.enums.VehicleStatus;
import br.pucminas.exception.ContractAccessDeniedException;
import br.pucminas.exception.ContractNotEligibleException;
import br.pucminas.exception.ContractNotFoundException;
import br.pucminas.exception.RentalRequestNotFoundException;
import br.pucminas.model.Bank;
import br.pucminas.model.Client;
import br.pucminas.model.Company;
import br.pucminas.model.Contract;
import br.pucminas.model.CreditContract;
import br.pucminas.model.RentalRequest;
import br.pucminas.model.User;
import br.pucminas.model.Vehicle;
import br.pucminas.repository.ContractRepository;
import br.pucminas.repository.CreditContractRepository;
import br.pucminas.repository.RentalRequestRepository;
import br.pucminas.repository.UserRepository;
import br.pucminas.repository.VehicleRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class ContractService {

    private final ContractRepository contractRepository;
    private final CreditContractRepository creditContractRepository;
    private final RentalRequestRepository rentalRequestRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public ContractService(ContractRepository contractRepository,
            CreditContractRepository creditContractRepository,
            RentalRequestRepository rentalRequestRepository,
            VehicleRepository vehicleRepository,
            UserRepository userRepository) {
        this.contractRepository = contractRepository;
        this.creditContractRepository = creditContractRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ContractResponse create(CreateContractRequest request, String companyEmail) {
        Company company = resolveCompany(companyEmail);

        RentalRequest rentalRequest = rentalRequestRepository.findById(request.rentalRequestId())
                .orElseThrow(() -> new RentalRequestNotFoundException(request.rentalRequestId()));

        if (rentalRequest.getCompanyApproval() != ApprovalStatus.APPROVED
                || rentalRequest.getBankApproval() != ApprovalStatus.APPROVED) {
            throw new ContractNotEligibleException(
                    "Rental request must be approved by company and bank before signing a contract");
        }

        if (!rentalRequest.getVehicle().getCompany().getId().equals(company.getId())) {
            throw new ContractAccessDeniedException("Rental request does not belong to this company");
        }

        contractRepository.findByRentalRequestId(rentalRequest.getId()).ifPresent(c -> {
            throw new ContractNotEligibleException("A contract already exists for this rental request");
        });

        Vehicle vehicle = rentalRequest.getVehicle();
        vehicle.setStatus(VehicleStatus.UNAVAILABLE);
        vehicleRepository.update(vehicle);

        Contract contract = new Contract(rentalRequest, request.signatureDate(), request.value(),
                request.ownership(), rentalRequest.isCreditRequested());
        return toResponse(contractRepository.save(contract));
    }

    @Transactional
    public ContractResponse update(UUID contractId, UpdateContractRequest request, String companyEmail) {
        Company company = resolveCompany(companyEmail);
        Contract contract = loadContract(contractId);

        if (!contract.getRentalRequest().getVehicle().getCompany().getId().equals(company.getId())) {
            throw new ContractAccessDeniedException();
        }
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new ContractNotEligibleException("Only active contracts can be edited");
        }

        contract.setSignatureDate(request.signatureDate());
        contract.setValue(request.value());
        contract.setOwnership(request.ownership());
        return toResponse(contractRepository.update(contract));
    }

    @Transactional
    public ContractResponse rescind(UUID contractId, String principalEmail) {
        Contract contract = loadContract(contractId);
        User user = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isCompany = user instanceof Company company
                && contract.getRentalRequest().getVehicle().getCompany().getId().equals(company.getId());
        boolean isClient = user instanceof Client client
                && contract.getRentalRequest().getClient().getId().equals(client.getId());
        if (!isCompany && !isClient) {
            throw new ContractAccessDeniedException();
        }

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new ContractNotEligibleException("Contract is not active");
        }

        creditContractRepository.findByContractId(contract.getId()).ifPresent(cc -> {
            if (cc.getStatus() == CreditContractStatus.GRANTED) {
                throw new ContractNotEligibleException(
                        "Contract cannot be rescinded because the credit contract was already granted");
            }
        });

        contract.setStatus(ContractStatus.TERMINATED);
        contract.setTerminatedAt(LocalDateTime.now());

        Vehicle vehicle = contract.getRentalRequest().getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.update(vehicle);

        return toResponse(contractRepository.update(contract));
    }

    public ContractResponse findById(UUID id, String principalEmail) {
        Contract contract = loadContract(id);
        assertCanView(contract, principalEmail);
        return toResponse(contract);
    }

    public ContractResponse findByRentalRequestId(UUID rentalRequestId, String principalEmail) {
        Contract contract = contractRepository.findByRentalRequestId(rentalRequestId)
                .orElseThrow(() -> new ContractNotFoundException(rentalRequestId));
        assertCanView(contract, principalEmail);
        return toResponse(contract);
    }

    public List<ContractResponse> listForCurrentUser(String principalEmail) {
        User user = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Contract> contracts;
        if (user instanceof Client client) {
            contracts = contractRepository.findByClientId(client.getId());
        } else if (user instanceof Company company) {
            contracts = contractRepository.findByCompanyId(company.getId());
        } else if (user instanceof Bank bank) {
            contracts = contractRepository.findByBankId(bank.getId());
        } else {
            contracts = StreamSupport.stream(contractRepository.findAll().spliterator(), false)
                    .collect(Collectors.toList());
        }
        return contracts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void assertCanView(Contract contract, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UUID clientId = contract.getRentalRequest().getClient().getId();
        UUID companyId = contract.getRentalRequest().getVehicle().getCompany().getId();
        UUID bankId = contract.getRentalRequest().getBank().getId();

        boolean allowed = (user instanceof Client c && c.getId().equals(clientId))
                || (user instanceof Company co && co.getId().equals(companyId))
                || (user instanceof Bank b && b.getId().equals(bankId));
        if (!allowed) {
            throw new ContractAccessDeniedException();
        }
    }

    private Company resolveCompany(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Company company)) {
            throw new IllegalArgumentException("User is not a Company");
        }
        return company;
    }

    private Contract loadContract(UUID id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ContractNotFoundException(id));
    }

    private ContractResponse toResponse(Contract contract) {
        RentalRequest rr = contract.getRentalRequest();
        Vehicle vehicle = rr.getVehicle();
        Company company = vehicle.getCompany();
        Client client = rr.getClient();
        Bank bank = rr.getBank();
        UUID creditId = creditContractRepository.findByContractId(contract.getId())
                .map(CreditContract::getId)
                .orElse(null);
        return new ContractResponse(
                contract.getId(),
                rr.getId(),
                vehicle.getId(),
                vehicle.getPlate(),
                vehicle.getModel(),
                vehicle.getBrand(),
                client.getId(),
                client.getName(),
                company.getId(),
                company.getCorporateName(),
                bank.getId(),
                bank.getName(),
                contract.getSignatureDate(),
                contract.getValue(),
                contract.getOwnership(),
                contract.getStatus(),
                contract.getTerminatedAt(),
                contract.isCreditRequested(),
                creditId);
    }
}
