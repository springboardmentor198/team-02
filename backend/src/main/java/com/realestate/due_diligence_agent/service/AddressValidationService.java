package com.realestate.due_diligence_agent.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.realestate.due_diligence_agent.dto.AddressValidationResponse;

@Service
public class AddressValidationService {

    private static final Logger log =
            LoggerFactory.getLogger(AddressValidationService.class);

    private final RestTemplate restTemplate;

    @Value("${address.validation.nominatim-url:https://nominatim.openstreetmap.org/search}")
    private String nominatimUrl;

    @Value("${address.validation.user-agent:DueDiligenceAgent/1.0}")
    private String userAgent;

    public AddressValidationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 500, multiplier = 2)
    )
    public AddressValidationResponse validateAddress(String address) {

        // Basic input validation
        if (address == null || address.isBlank()) {
            return new AddressValidationResponse(
                    false,
                    "Address cannot be empty"
            );
        }

        String trimmed = address.trim();

        if (trimmed.length() < 3) {
            return new AddressValidationResponse(
                    false,
                    "Address is too short"
            );
        }

        try {
            List<Map<String, Object>> results = lookup(trimmed);

            // No geocoding result
            if (results == null || results.isEmpty()) {
                return new AddressValidationResponse(
                        false,
                        "We couldn't verify this address. Check the spelling and make sure to include a city and state."
                );
            }

            Map<String, Object> best = results.get(0);

            /*
             * IMPORTANT:
             * A Nominatim search result does NOT automatically mean
             * that the input is a valid property address.
             *
             * We inspect the structured address components before
             * marking it as verified.
             */
            if (!isValidPropertyAddress(best)) {

                log.info(
                        "Nominatim returned a result, but it is not a sufficiently specific property address: {}",
                        trimmed
                );

                return new AddressValidationResponse(
                        false,
                        "The location was found, but it does not appear to be a complete property address. Please include a house number, street, and city."
                );
            }

            String displayName =
                    best.get("display_name") != null
                            ? String.valueOf(best.get("display_name"))
                            : trimmed;

            AddressValidationResponse result =
                    new AddressValidationResponse(
                            true,
                            "Address verified successfully"
                    );

            result.setFormattedAddress(displayName);
            result.setLatitude(parseDouble(best.get("lat")));
            result.setLongitude(parseDouble(best.get("lon")));

            return result;

        } catch (Exception ex) {

            /*
             * Let @Retryable handle the retry.
             */
            log.warn(
                    "Address validation request failed for '{}': {}",
                    trimmed,
                    ex.getMessage()
            );

            throw ex;
        }
    }

    /**
     * Determines whether a Nominatim result represents a sufficiently
     * specific property address.
     *
     * We require:
     *  - house number
     *  - road/street
     *  - locality (city/town/village/municipality)
     *  - country
     */
    private boolean isValidPropertyAddress(Map<String, Object> result) {

        if (result == null) {
            return false;
        }

        Object addressObject = result.get("address");

        if (!(addressObject instanceof Map<?, ?>)) {
            return false;
        }

        Map<?, ?> address = (Map<?, ?>) addressObject;

        boolean hasHouseNumber =
                hasValue(address, "house_number");

        boolean hasRoad =
                hasValue(address, "road")
                        || hasValue(address, "street");

        boolean hasLocality =
                hasValue(address, "city")
                        || hasValue(address, "town")
                        || hasValue(address, "village")
                        || hasValue(address, "municipality");

        boolean hasCountry =
                hasValue(address, "country");

        return hasHouseNumber
                && hasRoad
                && hasLocality
                && hasCountry;
    }

    /**
     * Safely checks whether an address component exists and
     * contains a non-empty value.
     */
    private boolean hasValue(Map<?, ?> address, String key) {

        Object value = address.get(key);

        return value != null
                && !String.valueOf(value).trim().isEmpty();
    }

    /**
     * Calls OpenStreetMap Nominatim.
     */
    private List<Map<String, Object>> lookup(String address) {

        URI uri = UriComponentsBuilder
                .fromHttpUrl(nominatimUrl)
                .queryParam("q", address)
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .queryParam("limit", 1)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();

        /*
         * Nominatim requires an identifying User-Agent.
         */
        headers.set(HttpHeaders.USER_AGENT, userAgent);

        HttpEntity<Void> request =
                new HttpEntity<>(headers);

        ResponseEntity<List<Map<String, Object>>> response =
                restTemplate.exchange(
                        uri,
                        HttpMethod.GET,
                        request,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {
                        }
                );

        return response.getBody();
    }

    private Double parseDouble(Object value) {

        if (value == null) {
            return null;
        }

        try {
            return Double.parseDouble(
                    String.valueOf(value)
            );
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Recover
    public AddressValidationResponse recoverValidateAddress(
            Exception ex,
            String address
    ) {

        log.warn(
                "Address validation failed after retries for address '{}': {}",
                address,
                ex.getMessage()
        );

        return new AddressValidationResponse(
                false,
                "Address validation service is currently unavailable. Please try again later."
        );
    }
}