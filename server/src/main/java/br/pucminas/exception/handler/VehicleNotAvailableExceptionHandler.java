package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.VehicleNotAvailableException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { VehicleNotAvailableException.class, ExceptionHandler.class })
public class VehicleNotAvailableExceptionHandler
        implements ExceptionHandler<VehicleNotAvailableException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, VehicleNotAvailableException exception) {
        return HttpResponse.<ErrorResponse>status(HttpStatus.CONFLICT).body(new ErrorResponse(exception.getMessage()));
    }
}
