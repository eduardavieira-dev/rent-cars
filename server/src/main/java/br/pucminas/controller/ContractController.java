package br.pucminas.controller;

import br.pucminas.dto.request.CreateContractRequest;
import br.pucminas.dto.request.UpdateContractRequest;
import br.pucminas.dto.response.ContractResponse;
import br.pucminas.service.ContractService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Controller("/contracts")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public HttpResponse<ContractResponse> create(@Valid @Body CreateContractRequest request, Principal principal) {
        return HttpResponse.created(contractService.create(request, principal.getName()));
    }

    @Put("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public ContractResponse update(UUID id, @Valid @Body UpdateContractRequest request, Principal principal) {
        return contractService.update(id, request, principal.getName());
    }

    @Post("/{id}/rescind")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY", "CLIENT" })
    public ContractResponse rescind(UUID id, Principal principal) {
        return contractService.rescind(id, principal.getName());
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public List<ContractResponse> listForCurrentUser(Principal principal) {
        return contractService.listForCurrentUser(principal.getName());
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public ContractResponse findById(UUID id, Principal principal) {
        return contractService.findById(id, principal.getName());
    }

    @Get("/rental-request/{rentalRequestId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ContractResponse findByRentalRequest(UUID rentalRequestId, Principal principal) {
        return contractService.findByRentalRequestId(rentalRequestId, principal.getName());
    }
}
