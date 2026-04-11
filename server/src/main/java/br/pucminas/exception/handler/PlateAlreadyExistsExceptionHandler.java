package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.PlateAlreadyExistsException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { PlateAlreadyExistsException.class, ExceptionHandler.class })
public class PlateAlreadyExistsExceptionHandler
        implements ExceptionHandler<PlateAlreadyExistsException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, PlateAlreadyExistsException exception) {
        return HttpResponse.<ErrorResponse>status(HttpStatus.CONFLICT).body(new ErrorResponse(exception.getMessage()));
    }
}
