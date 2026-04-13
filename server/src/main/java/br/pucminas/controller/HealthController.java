package br.pucminas.controller;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.util.Map;

@Secured(SecurityRule.IS_ANONYMOUS)
@Controller("/health")
public class HealthController {

    @Get
    public HttpResponse<Map<String, String>> health() {
        return HttpResponse.ok(Map.of("status", "UP"));
    }
}
