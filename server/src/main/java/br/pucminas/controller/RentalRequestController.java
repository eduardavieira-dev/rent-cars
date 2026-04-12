package br.pucminas.controller;

import br.pucminas.dto.request.CreateRentalRequest;
import br.pucminas.dto.request.RentalApprovalRequest;
import br.pucminas.dto.response.RentalRequestResponse;
import br.pucminas.service.RentalRequestService;
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

@Controller("/rental-requests")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class RentalRequestController {

    private final RentalRequestService rentalRequestService;

    public RentalRequestController(RentalRequestService rentalRequestService) {
        this.rentalRequestService = rentalRequestService;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "CLIENT" })
    public HttpResponse<RentalRequestResponse> requestRental(@Valid @Body CreateRentalRequest request,
            Principal principal) {
        return HttpResponse.created(
                rentalRequestService.requestRental(request.vehicleId(), request.bankId(), principal.getName()));
    }

    @Put("/company-approval")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public RentalRequestResponse approveByCompany(@Valid @Body RentalApprovalRequest request, Principal principal) {
        return rentalRequestService.approveByCompany(request.rentalRequestId(), request.approved(),
                principal.getName());
    }

    @Put("/bank-approval")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public RentalRequestResponse approveByBank(@Valid @Body RentalApprovalRequest request, Principal principal) {
        return rentalRequestService.approveByBank(request.rentalRequestId(), request.approved(), principal.getName());
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public List<RentalRequestResponse> listAll() {
        return rentalRequestService.listAll();
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public RentalRequestResponse findById(UUID id) {
        return rentalRequestService.findById(id);
    }

    @Get("/vehicle/{vehicleId}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<RentalRequestResponse> listByVehicle(UUID vehicleId) {
        return rentalRequestService.listByVehicle(vehicleId);
    }

    @Get("/client/{clientId}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<RentalRequestResponse> listByClient(UUID clientId) {
        return rentalRequestService.listByClient(clientId);
    }

    @Get("/bank/{bankId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "BANK" })
    public List<RentalRequestResponse> listByBank(UUID bankId) {
        return rentalRequestService.listByBank(bankId);
    }

    @Get("/company/{companyId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public List<RentalRequestResponse> listByCompany(UUID companyId) {
        return rentalRequestService.listByCompany(companyId);
    }
}
