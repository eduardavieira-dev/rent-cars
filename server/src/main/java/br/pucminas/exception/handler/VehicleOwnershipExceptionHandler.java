package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.VehicleOwnershipException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { VehicleOwnershipException.class, ExceptionHandler.class })
public class VehicleOwnershipExceptionHandler
        implements ExceptionHandler<VehicleOwnershipException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, VehicleOwnershipException exception) {
        return HttpResponse.status(io.micronaut.http.HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(exception.getMessage()));
    }
}
