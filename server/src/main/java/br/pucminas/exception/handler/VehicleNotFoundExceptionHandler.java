package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.VehicleNotFoundException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { VehicleNotFoundException.class, ExceptionHandler.class })
public class VehicleNotFoundExceptionHandler
        implements ExceptionHandler<VehicleNotFoundException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, VehicleNotFoundException exception) {
        return HttpResponse.notFound(new ErrorResponse(exception.getMessage()));
    }
}
