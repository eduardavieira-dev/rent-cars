package br.pucminas.security;

import at.favre.lib.crypto.bcrypt.BCrypt;
import br.pucminas.model.User;
import br.pucminas.repository.UserRepository;
import io.micronaut.core.async.publisher.Publishers;
import io.micronaut.http.HttpRequest;
import io.micronaut.security.authentication.AuthenticationFailureReason;
import io.micronaut.security.authentication.AuthenticationProvider;
import io.micronaut.security.authentication.AuthenticationRequest;
import io.micronaut.security.authentication.AuthenticationResponse;
import jakarta.inject.Singleton;
import org.reactivestreams.Publisher;

import java.util.List;
import java.util.Optional;

@Singleton
@SuppressWarnings("deprecation")
public class AuthenticationProviderService implements AuthenticationProvider<HttpRequest<?>> {

    private final UserRepository userRepository;

    public AuthenticationProviderService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Publisher<AuthenticationResponse> authenticate(HttpRequest<?> httpRequest,
            AuthenticationRequest<?, ?> authenticationRequest) {
        String email = authenticationRequest.getIdentity().toString();
        String rawPassword = authenticationRequest.getSecret().toString();

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return Publishers.just(
                    AuthenticationResponse.failure(AuthenticationFailureReason.USER_NOT_FOUND));
        }

        User user = userOptional.get();
        BCrypt.Result result = BCrypt.verifyer().verify(rawPassword.toCharArray(), user.getPassword().toCharArray());
        if (!result.verified) {
            return Publishers.just(
                    AuthenticationResponse.failure(AuthenticationFailureReason.CREDENTIALS_DO_NOT_MATCH));
        }

        String role = "ROLE_" + user.getClass().getSimpleName().toUpperCase();
        return Publishers.just(AuthenticationResponse.success(email, List.of(role)));
    }
}
