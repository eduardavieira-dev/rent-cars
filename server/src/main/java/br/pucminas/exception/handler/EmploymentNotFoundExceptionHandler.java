package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.EmploymentNotFoundException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { EmploymentNotFoundException.class, ExceptionHandler.class })
public class EmploymentNotFoundExceptionHandler
        implements ExceptionHandler<EmploymentNotFoundException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, EmploymentNotFoundException exception) {
        return HttpResponse.notFound(new ErrorResponse(exception.getMessage()));
    }
}
