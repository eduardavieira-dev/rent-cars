package br.pucminas.service;

import br.pucminas.dto.request.CreateEmploymentRequest;
import br.pucminas.dto.request.UpdateEmploymentRequest;
import br.pucminas.dto.response.EmploymentResponse;
import br.pucminas.exception.EmployerEntityNotFoundException;
import br.pucminas.exception.EmploymentLimitExceededException;
import br.pucminas.exception.EmploymentNotFoundException;
import br.pucminas.exception.UserNotFoundException;
import br.pucminas.model.Client;
import br.pucminas.model.EmployerEntity;
import br.pucminas.model.Employment;
import br.pucminas.model.User;
import br.pucminas.repository.EmployerEntityRepository;
import br.pucminas.repository.EmploymentRepository;
import br.pucminas.repository.UserRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class EmploymentService {

    private static final int MAX_EMPLOYMENTS_PER_CLIENT = 3;

    private final EmploymentRepository employmentRepository;
    private final UserRepository userRepository;
    private final EmployerEntityRepository employerEntityRepository;

    public EmploymentService(EmploymentRepository employmentRepository,
            UserRepository userRepository,
            EmployerEntityRepository employerEntityRepository) {
        this.employmentRepository = employmentRepository;
        this.userRepository = userRepository;
        this.employerEntityRepository = employerEntityRepository;
    }

    @Transactional
    public EmploymentResponse create(CreateEmploymentRequest request) {
        User user = userRepository.findById(request.clientId())
                .orElseThrow(() -> new UserNotFoundException(request.clientId()));
        if (!(user instanceof Client client)) {
            throw new IllegalArgumentException("User with id " + request.clientId() + " is not a Client");
        }

        long currentCount = employmentRepository.countByClientId(client.getId());
        if (currentCount >= MAX_EMPLOYMENTS_PER_CLIENT) {
            throw new EmploymentLimitExceededException(client.getId());
        }

        EmployerEntity employerEntity = employerEntityRepository.findById(request.employerEntityId())
                .orElseThrow(() -> new EmployerEntityNotFoundException(request.employerEntityId()));

        Employment employment = new Employment(
                request.earnedIncome(), request.jobTitle(), client, employerEntity);
        return toResponse(employmentRepository.save(employment));
    }

    public EmploymentResponse findById(UUID id) {
        Employment employment = employmentRepository.findById(id)
                .orElseThrow(() -> new EmploymentNotFoundException(id));
        return toResponse(employment);
    }

    public List<EmploymentResponse> listAll() {
        return StreamSupport.stream(employmentRepository.findAll().spliterator(), false)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<EmploymentResponse> listByClientId(UUID clientId) {
        return employmentRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmploymentResponse update(UUID id, UpdateEmploymentRequest request) {
        Employment employment = employmentRepository.findById(id)
                .orElseThrow(() -> new EmploymentNotFoundException(id));

        EmployerEntity employerEntity = employerEntityRepository.findById(request.employerEntityId())
                .orElseThrow(() -> new EmployerEntityNotFoundException(request.employerEntityId()));

        employment.setEarnedIncome(request.earnedIncome());
        employment.setJobTitle(request.jobTitle());
        employment.setEmployerEntity(employerEntity);
        return toResponse(employmentRepository.update(employment));
    }

    @Transactional
    public void delete(UUID id) {
        if (employmentRepository.existsById(id)) {
            employmentRepository.deleteById(id);
        }
    }

    private EmploymentResponse toResponse(Employment employment) {
        return new EmploymentResponse(
                employment.getId(),
                employment.getEarnedIncome(),
                employment.getJobTitle(),
                employment.getClient().getId(),
                employment.getClient().getName(),
                employment.getEmployerEntity().getId(),
                employment.getEmployerEntity().getName());
    }
}
