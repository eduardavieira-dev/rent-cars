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
import br.pucminas.repository.EmployerEntityRepository;
import br.pucminas.repository.EmploymentRepository;
import br.pucminas.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmploymentServiceTest {

    private EmploymentRepository employmentRepository;
    private UserRepository userRepository;
    private EmployerEntityRepository employerEntityRepository;
    private EmploymentService service;

    @BeforeEach
    void setUp() {
        employmentRepository = mock(EmploymentRepository.class);
        userRepository = mock(UserRepository.class);
        employerEntityRepository = mock(EmployerEntityRepository.class);
        service = new EmploymentService(employmentRepository, userRepository, employerEntityRepository);
    }

    @Test
    void shouldCreateEmploymentSuccessfully() {
        UUID clientId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        UUID employmentId = UUID.randomUUID();

        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);

        EmployerEntity employer = new EmployerEntity("Empresa ABC", "12345678000190");
        setEmployerEntityId(employer, employerEntityId);

        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(clientId)).thenReturn(0L);
        when(employerEntityRepository.findById(employerEntityId)).thenReturn(Optional.of(employer));

        Employment saved = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(saved, employmentId);
        when(employmentRepository.save(any(Employment.class))).thenReturn(saved);

        var request = new CreateEmploymentRequest(5000.0, "Analista", clientId, employerEntityId);
        EmploymentResponse response = service.create(request);

        assertNotNull(response);
        assertEquals(employmentId, response.id());
        assertEquals(5000.0, response.rendimentoAuferido());
        assertEquals("Analista", response.cargo());
        assertEquals(clientId, response.clientId());
        assertEquals("João", response.clientName());
        assertEquals(employerEntityId, response.employerEntityId());
        assertEquals("Empresa ABC", response.employerEntityNome());
    }

    @Test
    void shouldRejectCreateWhenClientNotFound() {
        UUID missingClientId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        when(userRepository.findById(missingClientId)).thenReturn(Optional.empty());

        var request = new CreateEmploymentRequest(5000.0, "Analista", missingClientId, employerEntityId);

        assertThrows(UserNotFoundException.class, () -> service.create(request));
        verify(employmentRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenUserIsNotClient() {
        UUID bankId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        var bank = new br.pucminas.model.Bank("Bank", "bank@email.com", "31999990001", "hashed", "12345678000190",
                "001");
        setBankId(bank, bankId);
        when(userRepository.findById(bankId)).thenReturn(Optional.of(bank));

        var request = new CreateEmploymentRequest(5000.0, "Analista", bankId, employerEntityId);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
    }

    @Test
    void shouldRejectCreateWhenLimitExceeded() {
        UUID clientId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);
        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(clientId)).thenReturn(3L);

        var request = new CreateEmploymentRequest(5000.0, "Analista", clientId, employerEntityId);

        assertThrows(EmploymentLimitExceededException.class, () -> service.create(request));
        verify(employmentRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenEmployerEntityNotFound() {
        UUID clientId = UUID.randomUUID();
        UUID missingEmployerEntityId = UUID.randomUUID();
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);
        when(userRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(clientId)).thenReturn(0L);
        when(employerEntityRepository.findById(missingEmployerEntityId)).thenReturn(Optional.empty());

        var request = new CreateEmploymentRequest(5000.0, "Analista", clientId, missingEmployerEntityId);

        assertThrows(EmployerEntityNotFoundException.class, () -> service.create(request));
    }

    @Test
    void shouldFindEmploymentById() {
        UUID clientId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        UUID employmentId = UUID.randomUUID();

        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);
        EmployerEntity employer = new EmployerEntity("Emp", "12345678000190");
        setEmployerEntityId(employer, employerEntityId);
        Employment emp = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(emp, employmentId);
        when(employmentRepository.findById(employmentId)).thenReturn(Optional.of(emp));

        EmploymentResponse response = service.findById(employmentId);

        assertEquals(employmentId, response.id());
        assertEquals("Analista", response.cargo());
    }

    @Test
    void shouldThrowWhenEmploymentNotFound() {
        UUID missingId = UUID.randomUUID();
        when(employmentRepository.findById(missingId)).thenReturn(Optional.empty());

        assertThrows(EmploymentNotFoundException.class, () -> service.findById(missingId));
    }

    @Test
    void shouldListEmploymentsByClientId() {
        UUID clientId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();

        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);
        EmployerEntity employer = new EmployerEntity("Emp", "12345678000190");
        setEmployerEntityId(employer, employerEntityId);

        Employment emp1 = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(emp1, UUID.randomUUID());
        Employment emp2 = new Employment(3000.0, "Estagiário", client, employer);
        setEmploymentId(emp2, UUID.randomUUID());

        when(employmentRepository.findByClientId(clientId)).thenReturn(List.of(emp1, emp2));

        List<EmploymentResponse> result = service.listByClientId(clientId);

        assertEquals(2, result.size());
    }

    @Test
    void shouldUpdateEmploymentSuccessfully() {
        UUID clientId = UUID.randomUUID();
        UUID oldEmployerEntityId = UUID.randomUUID();
        UUID newEmployerEntityId = UUID.randomUUID();
        UUID employmentId = UUID.randomUUID();

        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, clientId);
        EmployerEntity oldEmployer = new EmployerEntity("Old Emp", "11111111000100");
        setEmployerEntityId(oldEmployer, oldEmployerEntityId);
        EmployerEntity newEmployer = new EmployerEntity("New Emp", "22222222000200");
        setEmployerEntityId(newEmployer, newEmployerEntityId);

        Employment existing = new Employment(5000.0, "Analista", client, oldEmployer);
        setEmploymentId(existing, employmentId);
        when(employmentRepository.findById(employmentId)).thenReturn(Optional.of(existing));
        when(employerEntityRepository.findById(newEmployerEntityId)).thenReturn(Optional.of(newEmployer));
        when(employmentRepository.update(any(Employment.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateEmploymentRequest(8000.0, "Gerente", newEmployerEntityId);
        EmploymentResponse response = service.update(employmentId, request);

        assertEquals(8000.0, response.rendimentoAuferido());
        assertEquals("Gerente", response.cargo());
        assertEquals(newEmployerEntityId, response.employerEntityId());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentEmployment() {
        UUID missingId = UUID.randomUUID();
        UUID employerEntityId = UUID.randomUUID();
        when(employmentRepository.findById(missingId)).thenReturn(Optional.empty());

        var request = new UpdateEmploymentRequest(5000.0, "Analista", employerEntityId);

        assertThrows(EmploymentNotFoundException.class, () -> service.update(missingId, request));
    }

    @Test
    void shouldDeleteEmploymentSuccessfully() {
        UUID employmentId = UUID.randomUUID();
        when(employmentRepository.existsById(employmentId)).thenReturn(true);

        service.delete(employmentId);

        verify(employmentRepository).deleteById(employmentId);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentEmployment() {
        UUID missingId = UUID.randomUUID();
        when(employmentRepository.existsById(missingId)).thenReturn(false);

        assertThrows(EmploymentNotFoundException.class, () -> service.delete(missingId));
        verify(employmentRepository, never()).deleteById(any());
    }

    private void setClientId(Client client, UUID id) {
        try {
            var field = br.pucminas.model.User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(client, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setBankId(br.pucminas.model.Bank bank, UUID id) {
        try {
            var field = br.pucminas.model.User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(bank, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setEmployerEntityId(EmployerEntity entity, UUID id) {
        try {
            var field = EmployerEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setEmploymentId(Employment employment, UUID id) {
        try {
            var field = Employment.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(employment, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
