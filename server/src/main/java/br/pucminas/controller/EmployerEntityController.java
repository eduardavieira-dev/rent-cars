package br.pucminas.controller;

import br.pucminas.dto.request.CreateEmployerEntityRequest;
import br.pucminas.dto.request.UpdateEmployerEntityRequest;
import br.pucminas.dto.response.EmployerEntityResponse;
import br.pucminas.service.EmployerEntityService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@Controller("/employer-entities")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class EmployerEntityController {

    private final EmployerEntityService service;

    public EmployerEntityController(EmployerEntityService service) {
        this.service = service;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public HttpResponse<EmployerEntityResponse> create(@Valid @Body CreateEmployerEntityRequest request) {
        return HttpResponse.created(service.create(request));
    }

    @Get
    @Secured(SecurityRule.IS_ANONYMOUS)
    @Produces(MediaType.APPLICATION_JSON)
    public List<EmployerEntityResponse> listAll() {
        return service.listAll();
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public EmployerEntityResponse findById(UUID id) {
        return service.findById(id);
    }

    @Put("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public EmployerEntityResponse update(UUID id, @Valid @Body UpdateEmployerEntityRequest request) {
        return service.update(id, request);
    }

    @Delete("/{id}")
    public HttpResponse<Void> delete(UUID id) {
        service.delete(id);
        return HttpResponse.noContent();
    }
}
