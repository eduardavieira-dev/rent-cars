package br.pucminas.service;

import br.pucminas.dto.request.CreateCreditContractRequest;
import br.pucminas.dto.request.UpdateCreditContractRequest;
import br.pucminas.dto.response.CreditContractResponse;
import br.pucminas.enums.ContractStatus;
import br.pucminas.enums.CreditContractStatus;
import br.pucminas.exception.ContractAccessDeniedException;
import br.pucminas.exception.ContractNotFoundException;
import br.pucminas.exception.CreditContractInvalidStateException;
import br.pucminas.exception.CreditContractNotFoundException;
import br.pucminas.exception.CreditNotApplicableException;
import br.pucminas.model.Bank;
import br.pucminas.model.Client;
import br.pucminas.model.Company;
import br.pucminas.model.Contract;
import br.pucminas.model.CreditContract;
import br.pucminas.model.User;
import br.pucminas.repository.ContractRepository;
import br.pucminas.repository.CreditContractRepository;
import br.pucminas.repository.UserRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class CreditContractService {

    private final CreditContractRepository creditContractRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;

    public CreditContractService(CreditContractRepository creditContractRepository,
            ContractRepository contractRepository, UserRepository userRepository) {
        this.creditContractRepository = creditContractRepository;
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreditContractResponse create(CreateCreditContractRequest request, String bankEmail) {
        Bank bank = resolveBank(bankEmail);

        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new ContractNotFoundException(request.contractId()));

        if (!contract.getRentalRequest().getBank().getId().equals(bank.getId())) {
            throw new ContractAccessDeniedException("Contract does not belong to this bank");
        }
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new CreditContractInvalidStateException("Contract is not active");
        }
        if (!contract.isCreditRequested()) {
            throw new CreditNotApplicableException("Client did not request credit for this contract");
        }
        creditContractRepository.findByContractId(contract.getId()).ifPresent(cc -> {
            throw new CreditContractInvalidStateException("A credit contract already exists for this contract");
        });

        CreditContract creditContract = new CreditContract(contract, request.interestRate(), request.termMonths());
        return toResponse(creditContractRepository.save(creditContract));
    }

    @Transactional
    public CreditContractResponse update(UUID id, UpdateCreditContractRequest request, String bankEmail) {
        Bank bank = resolveBank(bankEmail);
        CreditContract cc = load(id);
        assertBankOwner(cc, bank);
        if (cc.getStatus() != CreditContractStatus.PENDING) {
            throw new CreditContractInvalidStateException("Only pending credit contracts can be edited");
        }
        cc.setInterestRate(request.interestRate());
        cc.setTermMonths(request.termMonths());
        return toResponse(creditContractRepository.update(cc));
    }

    @Transactional
    public CreditContractResponse approve(UUID id, String bankEmail) {
        Bank bank = resolveBank(bankEmail);
        CreditContract cc = load(id);
        assertBankOwner(cc, bank);
        if (cc.getStatus() != CreditContractStatus.PENDING) {
            throw new CreditContractInvalidStateException("Only pending credit contracts can be approved");
        }
        cc.setStatus(CreditContractStatus.APPROVED);
        cc.setApprovedAt(LocalDateTime.now());
        return toResponse(creditContractRepository.update(cc));
    }

    @Transactional
    public CreditContractResponse grant(UUID id, String bankEmail) {
        Bank bank = resolveBank(bankEmail);
        CreditContract cc = load(id);
        assertBankOwner(cc, bank);
        if (cc.getStatus() != CreditContractStatus.APPROVED) {
            throw new CreditContractInvalidStateException("Credit contract must be approved before granting");
        }
        cc.setStatus(CreditContractStatus.GRANTED);
        cc.setGrantedAt(LocalDateTime.now());
        return toResponse(creditContractRepository.update(cc));
    }

    public CreditContractResponse findById(UUID id, String principalEmail) {
        CreditContract cc = load(id);
        assertCanView(cc, principalEmail);
        return toResponse(cc);
    }

    public CreditContractResponse findByContractId(UUID contractId, String principalEmail) {
        CreditContract cc = creditContractRepository.findByContractId(contractId)
                .orElseThrow(() -> new CreditContractNotFoundException(contractId));
        assertCanView(cc, principalEmail);
        return toResponse(cc);
    }

    public List<CreditContractResponse> listForCurrentUser(String principalEmail) {
        User user = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<CreditContract> list;
        if (user instanceof Bank bank) {
            list = creditContractRepository.findByBankId(bank.getId());
        } else if (user instanceof Client client) {
            list = creditContractRepository.findByClientId(client.getId());
        } else if (user instanceof Company company) {
            list = creditContractRepository.findByCompanyId(company.getId());
        } else {
            list = StreamSupport.stream(creditContractRepository.findAll().spliterator(), false)
                    .collect(Collectors.toList());
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void assertBankOwner(CreditContract cc, Bank bank) {
        if (!cc.getContract().getRentalRequest().getBank().getId().equals(bank.getId())) {
            throw new ContractAccessDeniedException("Credit contract does not belong to this bank");
        }
    }

    private void assertCanView(CreditContract cc, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UUID clientId = cc.getContract().getRentalRequest().getClient().getId();
        UUID companyId = cc.getContract().getRentalRequest().getVehicle().getCompany().getId();
        UUID bankId = cc.getContract().getRentalRequest().getBank().getId();
        boolean allowed = (user instanceof Client c && c.getId().equals(clientId))
                || (user instanceof Company co && co.getId().equals(companyId))
                || (user instanceof Bank b && b.getId().equals(bankId));
        if (!allowed) {
            throw new ContractAccessDeniedException();
        }
    }

    private Bank resolveBank(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Bank bank)) {
            throw new IllegalArgumentException("User is not a Bank");
        }
        return bank;
    }

    private CreditContract load(UUID id) {
        return creditContractRepository.findById(id)
                .orElseThrow(() -> new CreditContractNotFoundException(id));
    }

    private CreditContractResponse toResponse(CreditContract cc) {
        Bank bank = cc.getContract().getRentalRequest().getBank();
        return new CreditContractResponse(
                cc.getId(),
                cc.getContract().getId(),
                bank.getId(),
                bank.getName(),
                cc.getInterestRate(),
                cc.getTermMonths(),
                cc.getStatus(),
                cc.getApprovedAt(),
                cc.getGrantedAt());
    }
}
