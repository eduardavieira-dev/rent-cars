package br.pucminas.controller;

import br.pucminas.dto.request.*;
import br.pucminas.dto.response.UserResponse;
import io.micronaut.core.type.Argument;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.client.exceptions.HttpClientResponseException;
import io.micronaut.security.authentication.UsernamePasswordCredentials;
import io.micronaut.security.token.render.BearerAccessRefreshToken;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest(transactional = false)
class UserControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    private String accessToken;

    @BeforeEach
    void setUp() {
        try {
            var registerRequest = new RegisterClientRequest(
                    "Admin User", "admin@email.com", "31999990200", "adminpass123",
                    "00011122233", null, null, null);
            client.toBlocking().exchange(
                    HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        } catch (HttpClientResponseException ignored) {
        }

        var credentials = new UsernamePasswordCredentials("admin@email.com", "adminpass123");
        var loginResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/login", credentials), BearerAccessRefreshToken.class);
        accessToken = loginResponse.body().getAccessToken();
    }

    @Test
    void shouldListAllUsers() {
        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/users").bearerAuth(accessToken),
                        Argument.listOf(UserResponse.class));

        assertEquals(HttpStatus.OK, response.getStatus());
        List<UserResponse> body = response.body();
        assertNotNull(body);
        assertFalse(body.isEmpty());
    }

    @Test
    void shouldGetUserById() {
        var registerRequest = new RegisterClientRequest(
                "Find Me User", "findme@email.com", "31999990201", "secret123",
                "11100022233", null, null, null);

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/users/" + userId).bearerAuth(accessToken), UserResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        UserResponse body = response.body();
        assertNotNull(body);
        assertEquals("Find Me User", body.name());
        assertEquals("findme@email.com", body.email());
    }

    @Test
    void shouldReturn404ForNonExistentUser() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/users/99999").bearerAuth(accessToken), UserResponse.class));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldUpdateClient() {
        var registerRequest = new RegisterClientRequest(
                "Update Client", "updateclient@email.com", "31999990202", "secret123",
                "22233344455", "MG9876543", "Rua Velha 1", "Professor");

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var updateRequest = new UpdateClientRequest(
                "Updated Client", "updateclient@email.com", "31999990203",
                "33344455566", "SP1234567", "Rua Nova 99", "Arquiteto");

        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/users/client/" + userId, updateRequest).bearerAuth(accessToken),
                        UserResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        UserResponse body = response.body();
        assertEquals("Updated Client", body.name());
        assertEquals("Client", body.type());
    }

    @Test
    void shouldUpdateBank() {
        var registerRequest = new RegisterBankRequest(
                "Update Bank", "updatebank@email.com", "31999990204", "secret123",
                "11222333000144", "003");

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/bank", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var updateRequest = new UpdateBankRequest(
                "Updated Bank", "updatebank@email.com", "31999990205",
                "11222333000144", "004");

        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/users/bank/" + userId, updateRequest).bearerAuth(accessToken),
                        UserResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Updated Bank", response.body().name());
    }

    @Test
    void shouldUpdateCompany() {
        var registerRequest = new RegisterCompanyRequest(
                "Update Company", "updatecomp@email.com", "31999990206", "secret123",
                "55666777000188", "Company Original Ltda");

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/company", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var updateRequest = new UpdateCompanyRequest(
                "Updated Company", "updatecomp@email.com", "31999990207",
                "55666777000188", "Company Updated SA");

        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/users/company/" + userId, updateRequest).bearerAuth(accessToken),
                        UserResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Updated Company", response.body().name());
    }

    @Test
    void shouldDeleteUser() {
        var registerRequest = new RegisterClientRequest(
                "Delete Me", "deleteme@email.com", "31999990208", "secret123",
                "44455566677", null, null, null);

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        try {
            client.toBlocking()
                    .exchange(HttpRequest.DELETE("/users/" + userId).bearerAuth(accessToken));
        } catch (Exception e) {
        }

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/users/" + userId).bearerAuth(accessToken), UserResponse.class));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldReturn404WhenDeletingNonExistentUser() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.DELETE("/users/99999").bearerAuth(accessToken)));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldRejectUpdateWithDuplicateEmail() {
        var request1 = new RegisterClientRequest(
                "User One", "userone@email.com", "31999990209", "secret123",
                "66677788899", null, null, null);
        client.toBlocking().exchange(HttpRequest.POST("/auth/register/client", request1), UserResponse.class);

        var request2 = new RegisterClientRequest(
                "User Two", "usertwo@email.com", "31999990210", "secret123",
                "88899900011", null, null, null);
        HttpResponse<UserResponse> response2 = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", request2), UserResponse.class);
        Long user2Id = response2.body().id();

        var updateRequest = new UpdateClientRequest(
                "User Two", "userone@email.com", "31999990210",
                "88899900011", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.PUT("/users/client/" + user2Id, updateRequest).bearerAuth(accessToken),
                                UserResponse.class));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void shouldAllowUpdateKeepingSameEmail() {
        var registerRequest = new RegisterClientRequest(
                "Same Email User", "sameemail@email.com", "31999990211", "secret123",
                "77788899900", null, null, null);

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var updateRequest = new UpdateClientRequest(
                "Same Email Updated", "sameemail@email.com", "31999990212",
                "77788899900", null, null, null);

        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/users/client/" + userId, updateRequest).bearerAuth(accessToken),
                        UserResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Same Email Updated", response.body().name());
    }

    @Test
    void shouldRejectUpdateWithInvalidData() {
        var registerRequest = new RegisterClientRequest(
                "Valid User", "validuser@email.com", "31999990213", "secret123",
                "11122200099", null, null, null);

        HttpResponse<UserResponse> createResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        Long userId = createResponse.body().id();

        var updateRequest = new UpdateClientRequest(
                "AB", "not-email", "123",
                "bad", null, null, null);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.PUT("/users/client/" + userId, updateRequest).bearerAuth(accessToken),
                                UserResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }
}
