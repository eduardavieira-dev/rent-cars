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
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);

        EmployerEntity employer = new EmployerEntity("Empresa ABC", "12345678000190");
        setEmployerEntityId(employer, 10L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(1L)).thenReturn(0L);
        when(employerEntityRepository.findById(10L)).thenReturn(Optional.of(employer));

        Employment saved = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(saved, 100L);
        when(employmentRepository.save(any(Employment.class))).thenReturn(saved);

        var request = new CreateEmploymentRequest(5000.0, "Analista", 1L, 10L);
        EmploymentResponse response = service.create(request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(5000.0, response.rendimentoAuferido());
        assertEquals("Analista", response.cargo());
        assertEquals(1L, response.clientId());
        assertEquals("João", response.clientName());
        assertEquals(10L, response.employerEntityId());
        assertEquals("Empresa ABC", response.employerEntityNome());
    }

    @Test
    void shouldRejectCreateWhenClientNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new CreateEmploymentRequest(5000.0, "Analista", 99L, 10L);

        assertThrows(UserNotFoundException.class, () -> service.create(request));
        verify(employmentRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenUserIsNotClient() {
        var bank = new br.pucminas.model.Bank("Bank", "bank@email.com", "31999990001", "hashed", "12345678000190",
                "001");
        setBankId(bank, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(bank));

        var request = new CreateEmploymentRequest(5000.0, "Analista", 1L, 10L);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
    }

    @Test
    void shouldRejectCreateWhenLimitExceeded() {
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(1L)).thenReturn(3L);

        var request = new CreateEmploymentRequest(5000.0, "Analista", 1L, 10L);

        assertThrows(EmploymentLimitExceededException.class, () -> service.create(request));
        verify(employmentRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenEmployerEntityNotFound() {
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(employmentRepository.countByClientId(1L)).thenReturn(0L);
        when(employerEntityRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new CreateEmploymentRequest(5000.0, "Analista", 1L, 99L);

        assertThrows(EmployerEntityNotFoundException.class, () -> service.create(request));
    }

    @Test
    void shouldFindEmploymentById() {
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);
        EmployerEntity employer = new EmployerEntity("Emp", "12345678000190");
        setEmployerEntityId(employer, 10L);
        Employment emp = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(emp, 100L);
        when(employmentRepository.findById(100L)).thenReturn(Optional.of(emp));

        EmploymentResponse response = service.findById(100L);

        assertEquals(100L, response.id());
        assertEquals("Analista", response.cargo());
    }

    @Test
    void shouldThrowWhenEmploymentNotFound() {
        when(employmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EmploymentNotFoundException.class, () -> service.findById(99L));
    }

    @Test
    void shouldListEmploymentsByClientId() {
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);
        EmployerEntity employer = new EmployerEntity("Emp", "12345678000190");
        setEmployerEntityId(employer, 10L);

        Employment emp1 = new Employment(5000.0, "Analista", client, employer);
        setEmploymentId(emp1, 100L);
        Employment emp2 = new Employment(3000.0, "Estagiário", client, employer);
        setEmploymentId(emp2, 101L);

        when(employmentRepository.findByClientId(1L)).thenReturn(List.of(emp1, emp2));

        List<EmploymentResponse> result = service.listByClientId(1L);

        assertEquals(2, result.size());
    }

    @Test
    void shouldUpdateEmploymentSuccessfully() {
        Client client = new Client("João", "joao@email.com", "31999990001", "hashed",
                "12345678901", null, null, "Dev");
        setClientId(client, 1L);
        EmployerEntity oldEmployer = new EmployerEntity("Old Emp", "11111111000100");
        setEmployerEntityId(oldEmployer, 10L);
        EmployerEntity newEmployer = new EmployerEntity("New Emp", "22222222000200");
        setEmployerEntityId(newEmployer, 20L);

        Employment existing = new Employment(5000.0, "Analista", client, oldEmployer);
        setEmploymentId(existing, 100L);
        when(employmentRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(employerEntityRepository.findById(20L)).thenReturn(Optional.of(newEmployer));
        when(employmentRepository.update(any(Employment.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateEmploymentRequest(8000.0, "Gerente", 20L);
        EmploymentResponse response = service.update(100L, request);

        assertEquals(8000.0, response.rendimentoAuferido());
        assertEquals("Gerente", response.cargo());
        assertEquals(20L, response.employerEntityId());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentEmployment() {
        when(employmentRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new UpdateEmploymentRequest(5000.0, "Analista", 10L);

        assertThrows(EmploymentNotFoundException.class, () -> service.update(99L, request));
    }

    @Test
    void shouldDeleteEmploymentSuccessfully() {
        when(employmentRepository.existsById(100L)).thenReturn(true);

        service.delete(100L);

        verify(employmentRepository).deleteById(100L);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentEmployment() {
        when(employmentRepository.existsById(99L)).thenReturn(false);

        assertThrows(EmploymentNotFoundException.class, () -> service.delete(99L));
        verify(employmentRepository, never()).deleteById(any());
    }

    private void setClientId(Client client, Long id) {
        try {
            var field = br.pucminas.model.User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(client, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setBankId(br.pucminas.model.Bank bank, Long id) {
        try {
            var field = br.pucminas.model.User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(bank, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setEmployerEntityId(EmployerEntity entity, Long id) {
        try {
            var field = EmployerEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setEmploymentId(Employment employment, Long id) {
        try {
            var field = Employment.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(employment, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
