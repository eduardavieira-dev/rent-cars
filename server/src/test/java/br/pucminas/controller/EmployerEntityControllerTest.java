package br.pucminas.controller;

import br.pucminas.dto.request.CreateEmployerEntityRequest;
import br.pucminas.dto.request.RegisterClientRequest;
import br.pucminas.dto.request.UpdateEmployerEntityRequest;
import br.pucminas.dto.response.EmployerEntityResponse;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest(transactional = false)
class EmployerEntityControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    private String accessToken;

    @BeforeEach
    void setUp() {
        try {
            var registerRequest = new RegisterClientRequest(
                    "EE Admin", "ee-admin@email.com", "31999990300", "adminpass123",
                    "90011122233", null, null, null);
            client.toBlocking().exchange(
                    HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        } catch (HttpClientResponseException ignored) {
        }

        var credentials = new UsernamePasswordCredentials("ee-admin@email.com", "adminpass123");
        var loginResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/login", credentials), BearerAccessRefreshToken.class);
        accessToken = loginResponse.body().getAccessToken();
    }

    @Test
    void shouldCreateEmployerEntity() {
        var request = new CreateEmployerEntityRequest("Empresa Teste", "10111222000100");

        HttpResponse<EmployerEntityResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                        EmployerEntityResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
        EmployerEntityResponse body = response.body();
        assertNotNull(body);
        assertNotNull(body.id());
        assertEquals("Empresa Teste", body.name());
        assertEquals("10111222000100", body.cnpj());
    }

    @Test
    void shouldRejectDuplicateCnpj() {
        var request = new CreateEmployerEntityRequest("Emp Dup", "20222333000100");
        client.toBlocking().exchange(
                HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                EmployerEntityResponse.class);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                        EmployerEntityResponse.class));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void shouldListAllEmployerEntities() {
        var request = new CreateEmployerEntityRequest("Emp List", "30333444000100");
        client.toBlocking().exchange(
                HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                EmployerEntityResponse.class);

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/employer-entities").bearerAuth(accessToken),
                        Argument.listOf(EmployerEntityResponse.class));

        assertEquals(HttpStatus.OK, response.getStatus());
        List<EmployerEntityResponse> body = response.body();
        assertNotNull(body);
        assertFalse(body.isEmpty());
    }

    @Test
    void shouldGetEmployerEntityById() {
        var request = new CreateEmployerEntityRequest("Emp FindById", "40444555000100");
        HttpResponse<EmployerEntityResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                        EmployerEntityResponse.class);
        UUID id = createResp.body().id();

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/employer-entities/" + id).bearerAuth(accessToken),
                        EmployerEntityResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Emp FindById", response.body().name());
    }

    @Test
    void shouldReturn404ForNonExistentEmployerEntity() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employer-entities/" + UUID.randomUUID()).bearerAuth(accessToken),
                                EmployerEntityResponse.class));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldUpdateEmployerEntity() {
        var createReq = new CreateEmployerEntityRequest("Emp Update", "50555666000100");
        HttpResponse<EmployerEntityResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employer-entities", createReq).bearerAuth(accessToken),
                        EmployerEntityResponse.class);
        UUID id = createResp.body().id();

        var updateReq = new UpdateEmployerEntityRequest("Emp Updated", "50555666000100");
        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/employer-entities/" + id, updateReq).bearerAuth(accessToken),
                        EmployerEntityResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Emp Updated", response.body().name());
    }

    @Test
    void shouldDeleteEmployerEntity() {
        var createReq = new CreateEmployerEntityRequest("Emp Delete", "60666777000100");
        HttpResponse<EmployerEntityResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employer-entities", createReq).bearerAuth(accessToken),
                        EmployerEntityResponse.class);
        UUID id = createResp.body().id();

        try {
            client.toBlocking()
                    .exchange(HttpRequest.DELETE("/employer-entities/" + id).bearerAuth(accessToken));
        } catch (Exception e) {
        }

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employer-entities/" + id).bearerAuth(accessToken),
                                EmployerEntityResponse.class));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldDeleteIdempotentlyWhenEmployerEntityNotFound() {
        try {
            client.toBlocking()
                    .exchange(
                            HttpRequest.DELETE("/employer-entities/" + UUID.randomUUID()).bearerAuth(accessToken));
        } catch (HttpClientResponseException e) {
            fail("Expected 204 No Content but got: " + e.getStatus());
        } catch (Exception ignored) {
            // Micronaut's Netty client may throw ResponseClosedException for 204 No Content
        }
    }

    @Test
    void shouldRejectInvalidCnpjFormat() {
        var request = new CreateEmployerEntityRequest("Invalid", "abc");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                        EmployerEntityResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectBlankName() {
        var request = new CreateEmployerEntityRequest("", "12345678000190");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employer-entities", request).bearerAuth(accessToken),
                        EmployerEntityResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRequireAuthentication() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employer-entities"), EmployerEntityResponse.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
