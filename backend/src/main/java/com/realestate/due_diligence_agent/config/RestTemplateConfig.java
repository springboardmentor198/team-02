package com.realestate.due_diligence_agent.config;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Shared RestTemplate for calling external services (e.g. the address
 * validation / geocoding lookup in AddressValidationService). Short
 * timeouts so a slow third-party API can't hang a request thread.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }
}
