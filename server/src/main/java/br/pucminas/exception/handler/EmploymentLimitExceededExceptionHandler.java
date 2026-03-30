package br.pucminas.exception.handler;

import br.pucminas.dto.response.ErrorResponse;
import br.pucminas.exception.EmploymentLimitExceededException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
@Requires(classes = { EmploymentLimitExceededException.class, ExceptionHandler.class })
public class EmploymentLimitExceededExceptionHandler
        implements ExceptionHandler<EmploymentLimitExceededException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, EmploymentLimitExceededException exception) {
        return HttpResponse.status(HttpStatus.CONFLICT).body(new ErrorResponse(exception.getMessage()));
    }
}
