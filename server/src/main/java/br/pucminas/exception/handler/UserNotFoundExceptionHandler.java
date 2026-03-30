package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.UserNotFoundException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { UserNotFoundException.class, ExceptionHandler.class })
public class UserNotFoundExceptionHandler
        implements ExceptionHandler<UserNotFoundException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, UserNotFoundException exception) {
        return HttpResponse.notFound(new ErrorResponse(exception.getMessage()));
    }
}
