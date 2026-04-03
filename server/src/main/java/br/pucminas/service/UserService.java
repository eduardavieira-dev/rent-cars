package br.pucminas.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import br.pucminas.model.*;
import br.pucminas.dto.request.*;
import br.pucminas.dto.response.UserResponse;
import br.pucminas.exception.CpfAlreadyExistsException;
import br.pucminas.exception.EmailAlreadyExistsException;
import br.pucminas.exception.UserNotFoundException;
import br.pucminas.repository.ClientRepository;
import br.pucminas.repository.UserRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    public UserService(UserRepository userRepository, ClientRepository clientRepository) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional
    public UserResponse registerClient(RegisterClientRequest request) {
        validateEmailUniqueness(request.email());
        validateCpfUniqueness(request.cpf());
        Client client = new Client(
                request.name(), request.email(), request.phone(), hashPassword(request.password()),
                request.cpf(), request.rg(), request.address(), request.profession());
        return toResponse(userRepository.save(client));
    }

    @Transactional
    public UserResponse registerBank(RegisterBankRequest request) {
        validateEmailUniqueness(request.email());
        Bank bank = new Bank(
                request.name(), request.email(), request.phone(), hashPassword(request.password()),
                request.cnpj(), request.code());
        return toResponse(userRepository.save(bank));
    }

    @Transactional
    public UserResponse registerCompany(RegisterCompanyRequest request) {
        validateEmailUniqueness(request.email());
        Company company = new Company(
                request.name(), request.email(), request.phone(), hashPassword(request.password()),
                request.cnpj(), request.corporateName());
        return toResponse(userRepository.save(company));
    }

    public UserResponse findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return toResponse(user);
    }

    public List<UserResponse> listAllUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateClient(UUID id, UpdateClientRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (!(user instanceof Client client)) {
            throw new IllegalArgumentException("User with id " + id + " is not a Client");
        }
        validateEmailUniquenessForUpdate(request.email(), id);
        client.setName(request.name());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setCpf(request.cpf());
        client.setRg(request.rg());
        client.setAddress(request.address());
        client.setProfession(request.profession());
        return toResponse(userRepository.update(client));
    }

    @Transactional
    public UserResponse updateBank(UUID id, UpdateBankRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (!(user instanceof Bank bank)) {
            throw new IllegalArgumentException("User with id " + id + " is not a Bank");
        }
        validateEmailUniquenessForUpdate(request.email(), id);
        bank.setName(request.name());
        bank.setEmail(request.email());
        bank.setPhone(request.phone());
        bank.setCnpj(request.cnpj());
        bank.setCode(request.code());
        return toResponse(userRepository.update(bank));
    }

    @Transactional
    public UserResponse updateCompany(UUID id, UpdateCompanyRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (!(user instanceof Company company)) {
            throw new IllegalArgumentException("User with id " + id + " is not a Company");
        }
        validateEmailUniquenessForUpdate(request.email(), id);
        company.setName(request.name());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setCnpj(request.cnpj());
        company.setCorporateName(request.corporateName());
        return toResponse(userRepository.update(company));
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        }
    }

    private void validateCpfUniqueness(String cpf) {
        if (clientRepository.existsByCpf(cpf)) {
            throw new CpfAlreadyExistsException(cpf);
        }
    }

    private void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }
    }

    private void validateEmailUniquenessForUpdate(String email, UUID currentUserId) {
        if (userRepository.existsByEmailAndIdNot(email, currentUserId)) {
            throw new EmailAlreadyExistsException(email);
        }
    }

    private String hashPassword(String rawPassword) {
        return BCrypt.withDefaults().hashToString(12, rawPassword.toCharArray());
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getClass().getSimpleName());
    }
}
