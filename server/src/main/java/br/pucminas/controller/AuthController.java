package br.pucminas.controller;

import br.pucminas.dto.request.RegisterBankRequest;
import br.pucminas.dto.request.RegisterClientRequest;
import br.pucminas.dto.request.RegisterCompanyRequest;
import br.pucminas.dto.response.UserResponse;
import br.pucminas.service.UserService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

@Controller("/auth")
@Secured(SecurityRule.IS_ANONYMOUS)
@Validated
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @Post("/register/client")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public HttpResponse<UserResponse> registerClient(@Valid @Body RegisterClientRequest request) {
        return HttpResponse.created(userService.registerClient(request));
    }

    @Post("/register/bank")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public HttpResponse<UserResponse> registerBank(@Valid @Body RegisterBankRequest request) {
        return HttpResponse.created(userService.registerBank(request));
    }

    @Post("/register/company")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public HttpResponse<UserResponse> registerCompany(@Valid @Body RegisterCompanyRequest request) {
        return HttpResponse.created(userService.registerCompany(request));
    }
}
