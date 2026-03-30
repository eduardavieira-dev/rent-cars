package br.pucminas.controller;

import br.pucminas.dto.request.UpdateBankRequest;
import br.pucminas.dto.request.UpdateClientRequest;
import br.pucminas.dto.request.UpdateCompanyRequest;
import br.pucminas.dto.response.UserResponse;
import br.pucminas.service.UserService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.util.List;

@Controller("/users")
@Secured(SecurityRule.IS_AUTHENTICATED)
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserResponse> listUsers() {
        return userService.listAllUsers();
    }

    @Get("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserResponse getUser(Long id) {
        return userService.findById(id);
    }

    @Put("/client/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public UserResponse updateClient(Long id, @Valid @Body UpdateClientRequest request) {
        return userService.updateClient(id, request);
    }

    @Put("/bank/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public UserResponse updateBank(Long id, @Valid @Body UpdateBankRequest request) {
        return userService.updateBank(id, request);
    }

    @Put("/company/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public UserResponse updateCompany(Long id, @Valid @Body UpdateCompanyRequest request) {
        return userService.updateCompany(id, request);
    }

    @Delete("/{id}")
    public HttpResponse<Void> deleteUser(Long id) {
        userService.deleteUser(id);
        return HttpResponse.noContent();
    }
}
