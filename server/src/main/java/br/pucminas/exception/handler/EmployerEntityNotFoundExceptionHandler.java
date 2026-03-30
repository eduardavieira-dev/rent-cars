package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.EmployerEntityNotFoundException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { EmployerEntityNotFoundException.class, ExceptionHandler.class })
public class EmployerEntityNotFoundExceptionHandler
        implements ExceptionHandler<EmployerEntityNotFoundException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, EmployerEntityNotFoundException exception) {
        return HttpResponse.notFound(new ErrorResponse(exception.getMessage()));
    }
}
