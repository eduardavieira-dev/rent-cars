package br.pucminas.controller;

import br.pucminas.dto.request.CreateCreditContractRequest;
import br.pucminas.dto.request.UpdateCreditContractRequest;
import br.pucminas.dto.response.CreditContractResponse;
import br.pucminas.service.CreditContractService;
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

@Controller("/credit-contracts")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class CreditContractController {

    private final CreditContractService creditContractService;

    public CreditContractController(CreditContractService creditContractService) {
        this.creditContractService = creditContractService;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public HttpResponse<CreditContractResponse> create(@Valid @Body CreateCreditContractRequest request,
            Principal principal) {
        return HttpResponse.created(creditContractService.create(request, principal.getName()));
    }

    @Put("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public CreditContractResponse update(UUID id, @Valid @Body UpdateCreditContractRequest request,
            Principal principal) {
        return creditContractService.update(id, request, principal.getName());
    }

    @Post("/{id}/approve")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public CreditContractResponse approve(UUID id, Principal principal) {
        return creditContractService.approve(id, principal.getName());
    }

    @Post("/{id}/grant")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public CreditContractResponse grant(UUID id, Principal principal) {
        return creditContractService.grant(id, principal.getName());
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public List<CreditContractResponse> listForCurrentUser(Principal principal) {
        return creditContractService.listForCurrentUser(principal.getName());
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public CreditContractResponse findById(UUID id, Principal principal) {
        return creditContractService.findById(id, principal.getName());
    }

    @Get("/contract/{contractId}")
    @Produces(MediaType.APPLICATION_JSON)
    public CreditContractResponse findByContract(UUID contractId, Principal principal) {
        return creditContractService.findByContractId(contractId, principal.getName());
    }
}
