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
        when(repository.existsByCnpj("12345678000190")).thenReturn(false);
        EmployerEntity saved = new EmployerEntity("Empresa ABC", "12345678000190");
        setId(saved, 1L);
        when(repository.save(any(EmployerEntity.class))).thenReturn(saved);

        var request = new CreateEmployerEntityRequest("Empresa ABC", "12345678000190");
        EmployerEntityResponse response = service.create(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Empresa ABC", response.nome());
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
        EmployerEntity entity = new EmployerEntity("Empresa XYZ", "99887766000155");
        setId(entity, 1L);
        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        EmployerEntityResponse response = service.findById(1L);

        assertEquals(1L, response.id());
        assertEquals("Empresa XYZ", response.nome());
    }

    @Test
    void shouldThrowWhenEmployerEntityNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EmployerEntityNotFoundException.class, () -> service.findById(99L));
    }

    @Test
    void shouldListAllEmployerEntities() {
        EmployerEntity e1 = new EmployerEntity("Emp1", "11111111000100");
        setId(e1, 1L);
        EmployerEntity e2 = new EmployerEntity("Emp2", "22222222000200");
        setId(e2, 2L);
        when(repository.findAll()).thenReturn(List.of(e1, e2));

        List<EmployerEntityResponse> result = service.listAll();

        assertEquals(2, result.size());
    }

    @Test
    void shouldUpdateEmployerEntitySuccessfully() {
        EmployerEntity existing = new EmployerEntity("Old Name", "12345678000190");
        setId(existing, 1L);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.existsByCnpjAndIdNot("99887766000155", 1L)).thenReturn(false);
        when(repository.update(any(EmployerEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateEmployerEntityRequest("New Name", "99887766000155");
        EmployerEntityResponse response = service.update(1L, request);

        assertEquals("New Name", response.nome());
        assertEquals("99887766000155", response.cnpj());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentEmployerEntity() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        var request = new UpdateEmployerEntityRequest("Name", "12345678000190");

        assertThrows(EmployerEntityNotFoundException.class, () -> service.update(99L, request));
    }

    @Test
    void shouldRejectDuplicateCnpjOnUpdate() {
        EmployerEntity existing = new EmployerEntity("Old", "12345678000190");
        setId(existing, 1L);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.existsByCnpjAndIdNot("99887766000155", 1L)).thenReturn(true);

        var request = new UpdateEmployerEntityRequest("Name", "99887766000155");

        assertThrows(CnpjAlreadyExistsException.class, () -> service.update(1L, request));
    }

    @Test
    void shouldDeleteEmployerEntitySuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);

        service.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentEmployerEntity() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThrows(EmployerEntityNotFoundException.class, () -> service.delete(99L));
        verify(repository, never()).deleteById(any());
    }

    private void setId(EmployerEntity entity, Long id) {
        try {
            var field = EmployerEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
