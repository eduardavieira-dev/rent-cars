package br.pucminas.security;

import br.pucminas.dto.request.RegisterClientRequest;
import br.pucminas.dto.response.UserResponse;
import io.micronaut.http.HttpRequest;
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

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest(transactional = false)
class AuthenticationTest {

    @Inject
    @Client("/")
    HttpClient client;

    private boolean userCreated = false;

    @BeforeEach
    void setUp() {
        if (!userCreated) {
            try {
                var registerRequest = new RegisterClientRequest(
                        "Auth User", "auth@email.com", "31999990100", "correctpassword",
                        "99988877766", null, null, null);
                client.toBlocking().exchange(
                        HttpRequest.POST("/auth/register/client", registerRequest), UserResponse.class);
                userCreated = true;
            } catch (HttpClientResponseException e) {
                if (e.getStatus() == HttpStatus.CONFLICT) {
                    userCreated = true;
                }
            }
        }
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        var credentials = new UsernamePasswordCredentials("auth@email.com", "correctpassword");

        var response = client.toBlocking()
                .exchange(HttpRequest.POST("/login", credentials), BearerAccessRefreshToken.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        BearerAccessRefreshToken token = response.body();
        assertNotNull(token);
        assertNotNull(token.getAccessToken());
        assertEquals("auth@email.com", token.getUsername());
        assertTrue(token.getRoles().contains("ROLE_CLIENT"));
    }

    @Test
    void shouldRejectLoginWithWrongPassword() {
        var credentials = new UsernamePasswordCredentials("auth@email.com", "wrongpassword");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/login", credentials),
                        BearerAccessRefreshToken.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void shouldRejectLoginWithNonExistentUser() {
        var credentials = new UsernamePasswordCredentials("nonexistent@email.com", "anypassword");

        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.POST("/login", credentials),
                        BearerAccessRefreshToken.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void shouldAccessProtectedEndpointWithValidToken() {
        var credentials = new UsernamePasswordCredentials("auth@email.com", "correctpassword");
        var loginResponse = client.toBlocking()
                .exchange(HttpRequest.POST("/login", credentials), BearerAccessRefreshToken.class);
        String accessToken = loginResponse.body().getAccessToken();

        var response = client.toBlocking()
                .exchange(HttpRequest.GET("/users").bearerAuth(accessToken), String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
    }

    @Test
    void shouldRejectProtectedEndpointWithoutToken() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking().exchange(HttpRequest.GET("/users"), String.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void shouldRejectProtectedEndpointWithInvalidToken() {
        HttpClientResponseException exception = assertThrows(HttpClientResponseException.class,
                () -> client.toBlocking()
                        .exchange(HttpRequest.GET("/users").bearerAuth("invalid.token.here"), String.class));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
