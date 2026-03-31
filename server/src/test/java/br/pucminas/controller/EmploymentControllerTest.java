package br.pucminas.controller;

import br.pucminas.dto.request.CreateEmployerEntityRequest;
import br.pucminas.dto.request.CreateEmploymentRequest;
import br.pucminas.dto.request.RegisterClientRequest;
import br.pucminas.dto.request.UpdateEmploymentRequest;
import br.pucminas.dto.response.EmployerEntityResponse;
import br.pucminas.dto.response.EmploymentResponse;
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

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest(transactional = false)
class EmploymentControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    private String accessToken;
    private UUID employerEntityId;

    private static final AtomicInteger COUNTER = new AtomicInteger(1);

    @BeforeEach
    void setUp() {
        try {
            var registerRequest = new RegisterClientRequest(
                    "Emp Admin", "emp-admin@email.com", "31999990400", "adminpass123",
                    "80011122233", null, null, null);
            client.toBlocking().exchange(
                    HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
        } catch (HttpClientResponseException ignored) {
        }

        var credentials = new UsernamePasswordCredentials("emp-admin@email.com", "adminpass123");
        var loginResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/login", credentials), BearerAccessRefreshToken.class);
        accessToken = loginResponse.body().getAccessToken();

        try {
            var eeReq = new CreateEmployerEntityRequest("Empresa Emprego Test", "70777888000100");
            HttpResponse<EmployerEntityResponse> eeResp = client.toBlocking()
                    .exchange(HttpRequest.POST("/employer-entities", eeReq).bearerAuth(accessToken),
                            EmployerEntityResponse.class);
            employerEntityId = eeResp.body().id();
        } catch (HttpClientResponseException e) {
            var listResp = client.toBlocking()
                    .exchange(HttpRequest.GET("/employer-entities").bearerAuth(accessToken),
                            Argument.listOf(EmployerEntityResponse.class));
            employerEntityId = listResp.body().stream()
                    .filter(ee -> "70777888000100".equals(ee.cnpj()))
                    .findFirst().orElseThrow().id();
        }
    }

    private UUID createFreshClient() {
        int n = COUNTER.getAndIncrement();
        String cpf = String.format("5%010d", n);
        String email = "empclient" + n + "@email.com";
        var regReq = new RegisterClientRequest(
                "Emp Client " + n, email, "31999990400", "pass12345",
                cpf, null, null, null);
        HttpResponse<UserResponse> resp = client.toBlocking().exchange(
                HttpRequest.POST("/auth/register/client", regReq), UserResponse.class);
        return resp.body().id();
    }

    @Test
    void shouldCreateEmployment() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(5000.0, "Analista de Sistemas", cid, employerEntityId);

        HttpResponse<EmploymentResponse> response = client.toBlocking()
                .exchange(HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatus());
        EmploymentResponse body = response.body();
        assertNotNull(body);
        assertNotNull(body.id());
        assertEquals(5000.0, body.rendimentoAuferido());
        assertEquals("Analista de Sistemas", body.cargo());
        assertEquals(cid, body.clientId());
        assertEquals(employerEntityId, body.employerEntityId());
    }

    @Test
    void shouldListAllEmployments() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(6000.0, "Dev ListAll", cid, employerEntityId);
        client.toBlocking().exchange(
                HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                EmploymentResponse.class);

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/employments").bearerAuth(accessToken),
                        Argument.listOf(EmploymentResponse.class));

        assertEquals(HttpStatus.OK, response.getStatus());
        assertNotNull(response.body());
        assertFalse(response.body().isEmpty());
    }

    @Test
    void shouldGetEmploymentById() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(7000.0, "Dev FindById", cid, employerEntityId);
        HttpResponse<EmploymentResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class);
        UUID empId = createResp.body().id();

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/employments/" + empId).bearerAuth(accessToken),
                        EmploymentResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals("Dev FindById", response.body().cargo());
    }

    @Test
    void shouldListEmploymentsByClient() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(3000.0, "Dev ByClient", cid, employerEntityId);
        client.toBlocking().exchange(
                HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                EmploymentResponse.class);

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/employments/client/" + cid).bearerAuth(accessToken),
                        Argument.listOf(EmploymentResponse.class));

        assertEquals(HttpStatus.OK, response.getStatus());
        assertNotNull(response.body());
        assertFalse(response.body().isEmpty());
        response.body().forEach(emp -> assertEquals(cid, emp.clientId()));
    }

    @Test
    void shouldReturn404ForNonExistentEmployment() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employments/" + UUID.randomUUID()).bearerAuth(accessToken),
                                EmploymentResponse.class));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldUpdateEmployment() {
        UUID cid = createFreshClient();
        var createReq = new CreateEmploymentRequest(4000.0, "Dev Junior", cid, employerEntityId);
        HttpResponse<EmploymentResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employments", createReq).bearerAuth(accessToken),
                        EmploymentResponse.class);
        UUID empId = createResp.body().id();

        var updateReq = new UpdateEmploymentRequest(8000.0, "Dev Senior", employerEntityId);

        var response = client.toBlocking()
                .exchange(HttpRequest.PUT("/employments/" + empId, updateReq).bearerAuth(accessToken),
                        EmploymentResponse.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals(8000.0, response.body().rendimentoAuferido());
        assertEquals("Dev Senior", response.body().cargo());
    }

    @Test
    void shouldDeleteEmployment() {
        UUID cid = createFreshClient();
        var createReq = new CreateEmploymentRequest(2000.0, "Dev Delete", cid, employerEntityId);
        HttpResponse<EmploymentResponse> createResp = client.toBlocking()
                .exchange(HttpRequest.POST("/employments", createReq).bearerAuth(accessToken),
                        EmploymentResponse.class);
        UUID empId = createResp.body().id();

        try {
            client.toBlocking()
                    .exchange(HttpRequest.DELETE("/employments/" + empId).bearerAuth(accessToken));
        } catch (Exception e) {
        }

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employments/" + empId).bearerAuth(accessToken),
                                EmploymentResponse.class));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldReturn404WhenDeletingNonExistentEmployment() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.DELETE("/employments/" + UUID.randomUUID()).bearerAuth(accessToken)));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldRejectInvalidRendimentoAuferido() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(-1.0, "Dev", cid, employerEntityId);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRejectBlankCargo() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(5000.0, "", cid, employerEntityId);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void shouldRequireAuthentication() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/employments"), EmploymentResponse.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void shouldRejectNonExistentClientId() {
        var request = new CreateEmploymentRequest(5000.0, "Dev", UUID.randomUUID(), employerEntityId);

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void shouldRejectNonExistentEmployerEntityId() {
        UUID cid = createFreshClient();
        var request = new CreateEmploymentRequest(5000.0, "Dev", cid, UUID.randomUUID());

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(
                        HttpRequest.POST("/employments", request).bearerAuth(accessToken),
                        EmploymentResponse.class));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }
}
