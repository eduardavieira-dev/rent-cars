package br.pucminas.service;

import br.pucminas.model.User;
import br.pucminas.repository.UserRepository;
import jakarta.inject.Singleton;

import java.util.List;

@Singleton
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User salvar(User user) {
        return repository.save(user);
    }

    public List<User> listar() {
        return (List<User>) repository.findAll();
    }
}