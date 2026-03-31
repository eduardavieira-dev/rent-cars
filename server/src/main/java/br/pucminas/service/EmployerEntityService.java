package br.pucminas.service;

import br.pucminas.dto.request.CreateEmployerEntityRequest;
import br.pucminas.dto.request.UpdateEmployerEntityRequest;
import br.pucminas.dto.response.EmployerEntityResponse;
import br.pucminas.exception.CnpjAlreadyExistsException;
import br.pucminas.exception.EmployerEntityNotFoundException;
import br.pucminas.model.EmployerEntity;
import br.pucminas.repository.EmployerEntityRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Singleton
public class EmployerEntityService {

    private final EmployerEntityRepository repository;

    public EmployerEntityService(EmployerEntityRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public EmployerEntityResponse create(CreateEmployerEntityRequest request) {
        if (repository.existsByCnpj(request.cnpj())) {
            throw new CnpjAlreadyExistsException(request.cnpj());
        }
        EmployerEntity entity = new EmployerEntity(request.nome(), request.cnpj());
        return toResponse(repository.save(entity));
    }

    public EmployerEntityResponse findById(UUID id) {
        EmployerEntity entity = repository.findById(id)
                .orElseThrow(() -> new EmployerEntityNotFoundException(id));
        return toResponse(entity);
    }

    public List<EmployerEntityResponse> listAll() {
        return StreamSupport.stream(repository.findAll().spliterator(), false)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployerEntityResponse update(UUID id, UpdateEmployerEntityRequest request) {
        EmployerEntity entity = repository.findById(id)
                .orElseThrow(() -> new EmployerEntityNotFoundException(id));
        if (repository.existsByCnpjAndIdNot(request.cnpj(), id)) {
            throw new CnpjAlreadyExistsException(request.cnpj());
        }
        entity.setNome(request.nome());
        entity.setCnpj(request.cnpj());
        return toResponse(repository.update(entity));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EmployerEntityNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private EmployerEntityResponse toResponse(EmployerEntity entity) {
        return new EmployerEntityResponse(entity.getId(), entity.getNome(), entity.getCnpj());
    }
}
