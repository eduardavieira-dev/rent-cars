package br.pucminas.controller;

import br.pucminas.dto.request.CreateVehicleRequest;
import br.pucminas.dto.request.UpdateVehicleRequest;
import br.pucminas.dto.response.VehicleResponse;
import br.pucminas.service.VehicleService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Controller("/vehicles")
@Validated
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @Post
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public HttpResponse<VehicleResponse> create(@Valid @Body CreateVehicleRequest request, Principal principal) {
        return HttpResponse.created(vehicleService.create(request, principal.getName()));
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    @Secured(SecurityRule.IS_ANONYMOUS)
    public List<VehicleResponse> listAll() {
        return vehicleService.listAll();
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured(SecurityRule.IS_ANONYMOUS)
    public VehicleResponse findById(UUID id) {
        return vehicleService.findById(id);
    }

    @Get("/company/{companyId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured(SecurityRule.IS_AUTHENTICATED)
    public List<VehicleResponse> listByCompany(UUID companyId) {
        return vehicleService.listByCompany(companyId);
    }

    @Get("/my-vehicles")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public List<VehicleResponse> listMyVehicles(Principal principal) {
        return vehicleService.listByCompanyEmail(principal.getName());
    }

    @Put("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public VehicleResponse update(UUID id, @Valid @Body UpdateVehicleRequest request, Principal principal) {
        return vehicleService.update(id, request, principal.getName());
    }

    @Put("/{id}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public VehicleResponse uploadImage(UUID id, @Part("image") CompletedFileUpload image, Principal principal) {
        return vehicleService.uploadImage(id, image, principal.getName());
    }

    @Delete("/{id}")
    @Secured({ "COMPANY" })
    public HttpResponse<Void> delete(UUID id, Principal principal) {
        vehicleService.delete(id, principal.getName());
        return HttpResponse.noContent();
    }

    @Patch("/{id}/reactivate")
    @Secured({ "COMPANY" })
    public HttpResponse<Void> reactivate(UUID id, Principal principal) {
        vehicleService.reactivate(id, principal.getName());
        return HttpResponse.noContent();
    }
}
