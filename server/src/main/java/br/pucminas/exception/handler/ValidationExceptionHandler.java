package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import io.micronaut.context.annotation.Replaces;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import io.micronaut.validation.exceptions.ConstraintExceptionHandler;
import jakarta.inject.Singleton;
import jakarta.validation.ConstraintViolationException;

import java.util.stream.Collectors;

@Produces
@Singleton
@Replaces(ConstraintExceptionHandler.class)
@Requires(classes = { ConstraintViolationException.class, ExceptionHandler.class })
public class ValidationExceptionHandler
        implements ExceptionHandler<ConstraintViolationException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, ConstraintViolationException exception) {
        String message = exception.getConstraintViolations().stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .collect(Collectors.joining(", "));
        return HttpResponse.badRequest(new ErrorResponse(message));
    }
}
