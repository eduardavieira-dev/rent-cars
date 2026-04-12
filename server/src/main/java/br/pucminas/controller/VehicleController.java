package br.pucminas.controller;

import br.pucminas.dto.request.CreateVehicleRequest;
import br.pucminas.dto.request.UpdateVehicleRequest;
import br.pucminas.dto.response.VehicleResponse;
import br.pucminas.service.VehicleService;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;

import java.math.BigDecimal;
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
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public HttpResponse<VehicleResponse> create(
            @Part("registrationCode") String registrationCode,
            @Part("year") Integer year,
            @Part("brand") String brand,
            @Part("model") String model,
            @Part("plate") String plate,
            @Nullable @Part("description") String description,
            @Nullable @Part("dailyRate") BigDecimal dailyRate,
            @Nullable @Part("image") CompletedFileUpload image,
            Principal principal) {
        CreateVehicleRequest request = new CreateVehicleRequest(
                registrationCode, year, brand, model, plate, description, dailyRate);
        return HttpResponse.created(vehicleService.create(request, image, principal.getName()));
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

    @Put("/{id}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({ "COMPANY" })
    public VehicleResponse update(
            UUID id,
            @Part("registrationCode") String registrationCode,
            @Part("year") Integer year,
            @Part("brand") String brand,
            @Part("model") String model,
            @Part("plate") String plate,
            @Nullable @Part("description") String description,
            @Nullable @Part("dailyRate") BigDecimal dailyRate,
            @Nullable @Part("image") CompletedFileUpload image,
            Principal principal) {
        UpdateVehicleRequest request = new UpdateVehicleRequest(
                registrationCode, year, brand, model, plate, description, dailyRate);
        return vehicleService.update(id, request, image, principal.getName());
    }

    @Delete("/{id}")
    @Secured({ "COMPANY" })
    public HttpResponse<Void> delete(UUID id, Principal principal) {
        vehicleService.delete(id, principal.getName());
        return HttpResponse.noContent();
    }
}
