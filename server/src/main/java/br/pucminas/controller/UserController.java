package br.pucminas.controller;

import br.pucminas.model.User;
import br.pucminas.service.UserService;
import io.micronaut.http.annotation.*;

import java.util.List;

@Controller("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @Post
    public User criar(@Body User user) {
        return service.salvar(user);
    }

    @Get
    public List<User> listar() {
        return service.listar();
    }
}