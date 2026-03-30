package br.pucminas.service;

import br.pucminas.model.Bank;
import br.pucminas.model.Client;
import br.pucminas.model.Company;
import br.pucminas.model.User;
import br.pucminas.dto.request.*;
import br.pucminas.dto.response.UserResponse;
import br.pucminas.exception.EmailAlreadyExistsException;
import br.pucminas.exception.UserNotFoundException;
import br.pucminas.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserService(userRepository);
    }

    @Test
    void shouldRegisterClientSuccessfully() {
        when(userRepository.existsByEmail("test@email.com")).thenReturn(false);
        Client savedClient = new Client("Test", "test@email.com", "31999990001", "hashed",
                "12345678901", null, null, null);
        setId(savedClient, 1L);
        when(userRepository.save(any(Client.class))).thenReturn(savedClient);

        var request = new RegisterClientRequest(
                "Test", "test@email.com", "31999990001", "secret123",
                "12345678901", null, null, null);
        UserResponse response = userService.registerClient(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test", response.name());
        assertEquals("Client", response.type());
        verify(userRepository).existsByEmail("test@email.com");
        verify(userRepository).save(any(Client.class));
    }

    @Test
    void shouldRejectDuplicateEmailOnRegisterClient() {
        when(userRepository.existsByEmail("taken@email.com")).thenReturn(true);

        var request = new RegisterClientRequest(
                "Test", "taken@email.com", "31999990001", "secret123",
                "12345678901", null, null, null);

        assertThrows(EmailAlreadyExistsException.class, () -> userService.registerClient(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldRegisterBankSuccessfully() {
        when(userRepository.existsByEmail("bank@email.com")).thenReturn(false);
        Bank savedBank = new Bank("Bank", "bank@email.com", "31999990001", "hashed", "12345678000190", "001");
        setId(savedBank, 2L);
        when(userRepository.save(any(Bank.class))).thenReturn(savedBank);

        var request = new RegisterBankRequest(
                "Bank", "bank@email.com", "31999990001", "secret123",
                "12345678000190", "001");
        UserResponse response = userService.registerBank(request);

        assertEquals("Bank", response.type());
        assertEquals(2L, response.id());
    }

    @Test
    void shouldRegisterCompanySuccessfully() {
        when(userRepository.existsByEmail("company@email.com")).thenReturn(false);
        Company savedCompany = new Company("Co", "company@email.com", "31999990001", "hashed",
                "12345678000190", "Co Ltda");
        setId(savedCompany, 3L);
        when(userRepository.save(any(Company.class))).thenReturn(savedCompany);

        var request = new RegisterCompanyRequest(
                "Co", "company@email.com", "31999990001", "secret123",
                "12345678000190", "Co Ltda");
        UserResponse response = userService.registerCompany(request);

        assertEquals("Company", response.type());
        assertEquals(3L, response.id());
    }

    @Test
    void shouldFindUserById() {
        Client client = new Client("Found", "found@email.com", "31999990001", "hashed",
                "12345678901", null, null, null);
        setId(client, 10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(client));

        UserResponse response = userService.findById(10L);

        assertEquals(10L, response.id());
        assertEquals("Found", response.name());
    }

    @Test
    void shouldThrowWhenUserNotFoundById() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.findById(99L));
    }

    @Test
    void shouldListAllUsers() {
        Client c1 = new Client("C1", "c1@email.com", "31999990001", "h", "12345678901", null, null, null);
        Bank b1 = new Bank("B1", "b1@email.com", "31999990002", "h", "12345678000190", "001");
        setId(c1, 1L);
        setId(b1, 2L);
        when(userRepository.findAll()).thenReturn(List.of(c1, b1));

        List<UserResponse> responses = userService.listAllUsers();

        assertEquals(2, responses.size());
        assertEquals("Client", responses.get(0).type());
        assertEquals("Bank", responses.get(1).type());
    }

    @Test
    void shouldReturnEmptyListWhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserResponse> responses = userService.listAllUsers();

        assertTrue(responses.isEmpty());
    }

    @Test
    void shouldUpdateClientSuccessfully() {
        Client existing = new Client("Old", "old@email.com", "31999990001", "hashed",
                "12345678901", "MG123", "Old address", "Old Prof");
        setId(existing, 5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmailAndIdNot("new@email.com", 5L)).thenReturn(false);
        when(userRepository.update(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        var request = new UpdateClientRequest(
                "New Name", "new@email.com", "31999990002",
                "99988877766", "SP456", "New address", "New Prof");

        UserResponse response = userService.updateClient(5L, request);

        assertEquals("New Name", response.name());
        assertEquals("new@email.com", response.email());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentClient() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new UpdateClientRequest(
                "Name", "e@email.com", "31999990001", "12345678901", null, null, null);

        assertThrows(UserNotFoundException.class, () -> userService.updateClient(99L, request));
    }

    @Test
    void shouldThrowWhenUpdatingWrongTypeAsClient() {
        Bank bank = new Bank("Bank", "bank@email.com", "31999990001", "hashed", "12345678000190", "001");
        setId(bank, 5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(bank));

        var request = new UpdateClientRequest(
                "Name", "e@email.com", "31999990001", "12345678901", null, null, null);

        assertThrows(IllegalArgumentException.class, () -> userService.updateClient(5L, request));
    }

    @Test
    void shouldRejectDuplicateEmailOnUpdate() {
        Client existing = new Client("Old", "old@email.com", "31999990001", "hashed",
                "12345678901", null, null, null);
        setId(existing, 5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmailAndIdNot("taken@email.com", 5L)).thenReturn(true);

        var request = new UpdateClientRequest(
                "Name", "taken@email.com", "31999990001", "12345678901", null, null, null);

        assertThrows(EmailAlreadyExistsException.class, () -> userService.updateClient(5L, request));
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        when(userRepository.existsById(5L)).thenReturn(true);

        userService.deleteUser(5L);

        verify(userRepository).deleteById(5L);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentUser() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(99L));
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void shouldHashPasswordOnRegistration() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(Client.class))).thenAnswer(inv -> {
            Client c = inv.getArgument(0);
            setId(c, 1L);
            return c;
        });

        var request = new RegisterClientRequest(
                "Test", "hash@email.com", "31999990001", "plaintext",
                "12345678901", null, null, null);
        userService.registerClient(request);

        verify(userRepository).save(argThat(user -> {
            String storedPassword = ((Client) user).getPassword();
            return storedPassword.startsWith("$2a$") && !storedPassword.equals("plaintext");
        }));
    }

    private void setId(User user, Long id) {
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
