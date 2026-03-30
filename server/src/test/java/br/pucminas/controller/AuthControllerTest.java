package br.pucminas.controller;

import br.pucminas.dto.request.RegisterBankRequest;
import br.pucminas.dto.request.RegisterClientRequest;
import br.pucminas.dto.request.RegisterCompanyRequest;
import br.pucminas.dto.response.UserResponse;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.client.exceptions.HttpClientResponseException;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest(transactional = false)
class AuthControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    @Test
    void shouldRegisterClientSuccessfully() {
        var request = new RegisterClientRequest(
                "João Silva", "joao@email.com", "31999990001", "secret123",
                "12345678901", "MG1234567", "Rua das Flores 42", "Engenheiro");

        HttpResponse<UserResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", request), UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
        UserResponse body = response.body();
        assertNotNull(body);
        assertNotNull(body.id());
        assertEquals("João Silva", body.name());
        assertEquals("joao@email.com", body.email());
        assertEquals("31999990001", body.phone());
        assertEquals("Client", body.type());
    }

    @Test
    void shouldRegisterBankSuccessfully() {
        var request = new RegisterBankRequest(
                "Banco Central", "banco@email.com", "31999990002", "secret123",
                "12345678000190", "001");

        HttpResponse<UserResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/bank", request), UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
        UserResponse body = response.body();
        assertNotNull(body);
        assertEquals("Banco Central", body.name());
        assertEquals("Bank", body.type());
    }

    @Test
    void shouldRegisterCompanySuccessfully() {
        var request = new RegisterCompanyRequest(
                "Empresa XYZ", "empresa@email.com", "31999990003", "secret123",
                "98765432000110", "Empresa XYZ Ltda");

        HttpResponse<UserResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/company", request), UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
        UserResponse body = response.body();
        assertNotNull(body);
        assertEquals("Empresa XYZ", body.name());
        assertEquals("Company", body.type());
    }

    @Test
    void shouldRejectDuplicateEmail() {
        var request1 = new RegisterClientRequest(
                "Maria Santos", "duplicate@email.com", "31999990004", "secret123",
                "11122233344", null, null, null);
        client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request1), UserResponse.class);

        var request2 = new RegisterClientRequest(
                "Outro Usuário", "duplicate@email.com", "31999990005", "secret123",
                "55566677788", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request2),
                        UserResponse.class));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidEmail() {
        var request = new RegisterClientRequest(
                "Test User", "not-an-email", "31999990006", "secret123",
                "12345678901", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectTooShortName() {
        var request = new RegisterClientRequest(
                "AB", "short@email.com", "31999990007", "secret123",
                "12345678901", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectTooShortPassword() {
        var request = new RegisterClientRequest(
                "Test User", "shortpwd@email.com", "31999990008", "12345",
                "12345678901", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidCpf() {
        var request = new RegisterClientRequest(
                "Test User", "badcpf@email.com", "31999990009", "secret123",
                "123", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidCnpj() {
        var request = new RegisterBankRequest(
                "Bad Bank", "badcnpj@email.com", "31999990010", "secret123",
                "123", "001");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/bank", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidBankCode() {
        var request = new RegisterBankRequest(
                "Bad Bank", "badcode@email.com", "31999990011", "secret123",
                "12345678000190", "ABCD");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/bank", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidPhone() {
        var request = new RegisterClientRequest(
                "Test User", "badphone@email.com", "123", "secret123",
                "12345678901", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectBlankRequiredFields() {
        var request = new RegisterClientRequest(
                "", "", "", "",
                "", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request),
                        UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldAcceptFormattedCpf() {
        var request = new RegisterClientRequest(
                "CPF Formatado", "fmtcpf@email.com", "31999990012", "secret123",
                "123.456.789-01", null, null, null);

        HttpResponse<UserResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", request), UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
    }

    @Test
    void shouldAcceptFormattedCnpj() {
        var request = new RegisterBankRequest(
                "CNPJ Formatado", "fmtcnpj@email.com", "31999990013", "secret123",
                "12.345.678/0001-90", "002");

        HttpResponse<UserResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/bank", request), UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
    }
}
