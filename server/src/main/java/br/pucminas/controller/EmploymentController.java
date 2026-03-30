package br.pucminas.controller;

import br.pucminas.dto.request.CreateEmploymentRequest;
import br.pucminas.dto.request.UpdateEmploymentRequest;
import br.pucminas.dto.response.EmploymentResponse;
import br.pucminas.service.EmploymentService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.util.List;

@Controller("/employments")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class EmploymentController {

    private final EmploymentService service;

    public EmploymentController(EmploymentService service) {
        this.service = service;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public HttpResponse<EmploymentResponse> create(@Valid @Body CreateEmploymentRequest request) {
        return HttpResponse.created(service.create(request));
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public List<EmploymentResponse> listAll() {
        return service.listAll();
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public EmploymentResponse findById(Long id) {
        return service.findById(id);
    }

    @Get("/client/{clientId}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<EmploymentResponse> listByClient(Long clientId) {
        return service.listByClientId(clientId);
    }

    @Put("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public EmploymentResponse update(Long id, @Valid @Body UpdateEmploymentRequest request) {
        return service.update(id, request);
    }

    @Delete("/{id}")
    public HttpResponse<Void> delete(Long id) {
        service.delete(id);
        return HttpResponse.noContent();
    }
}
