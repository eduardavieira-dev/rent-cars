package br.pucminas.service;

import br.pucminas.dto.request.CreateEmployerEntityRequest;
import br.pucminas.dto.request.UpdateEmployerEntityRequest;
import br.pucminas.dto.response.EmployerEntityResponse;
import br.pucminas.exception.CnpjAlreadyExistsException;
import br.pucminas.exception.EmployerEntityNotFoundException;
import br.pucminas.model.EmployerEntity;
import br.pucminas.repository.EmployerEntityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmployerEntityServiceTest {

    private EmployerEntityRepository repository;
    private EmployerEntityService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmployerEntityRepository.class);
        service = new EmployerEntityService(repository);
    }

    @Test
    void shouldCreateEmployerEntitySuccessfully() {
        UUID savedId = UUID.randomUUID();
        when(repository.existsByCnpj("12345678000190")).thenReturn(false);
        EmployerEntity saved = new EmployerEntity("Empresa ABC", "12345678000190");
        setId(saved, savedId);
        when(repository.save(any(EmployerEntity.class))).thenReturn(saved);

        var request = new CreateEmployerEntityRequest("Empresa ABC", "12345678000190");
        EmployerEntityResponse response = service.create(request);

        assertNotNull(response);
        assertEquals(savedId, response.id());
        assertEquals("Empresa ABC", response.name());
        assertEquals("12345678000190", response.cnpj());
        verify(repository).existsByCnpj("12345678000190");
        verify(repository).save(any(EmployerEntity.class));
    }

    @Test
    void shouldRejectDuplicateCnpjOnCreate() {
        when(repository.existsByCnpj("12345678000190")).thenReturn(true);

        var request = new CreateEmployerEntityRequest("Empresa ABC", "12345678000190");

        assertThrows(CnpjAlreadyExistsException.class, () -> service.create(request));
        verify(repository, never()).save(any());
    }

    @Test
    void shouldFindEmployerEntityById() {
        UUID entityId = UUID.randomUUID();
        EmployerEntity entity = new EmployerEntity("Empresa XYZ", "99887766000155");
        setId(entity, entityId);
        when(repository.findById(entityId)).thenReturn(Optional.of(entity));

        EmployerEntityResponse response = service.findById(entityId);

        assertEquals(entityId, response.id());
        assertEquals("Empresa XYZ", response.name());
    }

    @Test
    void shouldThrowWhenEmployerEntityNotFound() {
        UUID randomId = UUID.randomUUID();
        when(repository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(EmployerEntityNotFoundException.class, () -> service.findById(randomId));
    }

    @Test
    void shouldListAllEmployerEntities() {
        EmployerEntity e1 = new EmployerEntity("Emp1", "11111111000100");
        setId(e1, UUID.randomUUID());
        EmployerEntity e2 = new EmployerEntity("Emp2", "22222222000200");
        setId(e2, UUID.randomUUID());
        when(repository.findAll()).thenReturn(List.of(e1, e2));

        List<EmployerEntityResponse> result = service.listAll();

        assertEquals(2, result.size());
    }

    @Test
    void shouldUpdateEmployerEntitySuccessfully() {
        UUID entityId = UUID.randomUUID();
        EmployerEntity existing = new EmployerEntity("Old Name", "12345678000190");
        setId(existing, entityId);
        when(repository.findById(entityId)).thenReturn(Optional.of(existing));
        when(repository.existsByCnpjAndIdNot("99887766000155", entityId)).thenReturn(false);
        when(repository.update(any(EmployerEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateEmployerEntityRequest("New Name", "99887766000155");
        EmployerEntityResponse response = service.update(entityId, request);

        assertEquals("New Name", response.name());
        assertEquals("99887766000155", response.cnpj());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentEmployerEntity() {
        UUID randomId = UUID.randomUUID();
        when(repository.findById(randomId)).thenReturn(Optional.empty());

        var request = new UpdateEmployerEntityRequest("Name", "12345678000190");

        assertThrows(EmployerEntityNotFoundException.class, () -> service.update(randomId, request));
    }

    @Test
    void shouldRejectDuplicateCnpjOnUpdate() {
        UUID entityId = UUID.randomUUID();
        EmployerEntity existing = new EmployerEntity("Old", "12345678000190");
        setId(existing, entityId);
        when(repository.findById(entityId)).thenReturn(Optional.of(existing));
        when(repository.existsByCnpjAndIdNot("99887766000155", entityId)).thenReturn(true);

        var request = new UpdateEmployerEntityRequest("Name", "99887766000155");

        assertThrows(CnpjAlreadyExistsException.class, () -> service.update(entityId, request));
    }

    @Test
    void shouldDeleteEmployerEntitySuccessfully() {
        UUID entityId = UUID.randomUUID();
        when(repository.existsById(entityId)).thenReturn(true);

        service.delete(entityId);

        verify(repository).deleteById(entityId);
    }

    @Test
    void shouldDeleteIdempotentlyWhenEmployerEntityNotFound() {
        UUID randomId = UUID.randomUUID();
        when(repository.existsById(randomId)).thenReturn(false);

        service.delete(randomId);

        verify(repository, never()).deleteById(any());
    }

    private void setId(EmployerEntity entity, UUID id) {
        try {
            var field = EmployerEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
