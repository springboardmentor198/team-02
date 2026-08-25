package com.realestate.due_diligence_agent.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.realestate.due_diligence_agent.dto.AddressValidationResponse;

/**
 * Unit tests for AddressValidationService. The real Nominatim (OpenStreetMap)
 * geocoding lookup is stubbed out via a mocked RestTemplate so these tests
 * stay fast and don't depend on network access.
 */
class AddressValidationServiceTest {

    private RestTemplate restTemplate;
    private AddressValidationService addressValidationService;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        addressValidationService = new AddressValidationService(restTemplate);
        ReflectionTestUtils.setField(addressValidationService, "nominatimUrl", "https://nominatim.openstreetmap.org/search");
        ReflectionTestUtils.setField(addressValidationService, "userAgent", "DueDiligenceAgent/1.0-test");
    }

    private void mockLookupResult(List<Map<String, Object>> body) {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), any(org.springframework.core.ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.ok(body));
    }

    @Test
    void nullAddress_isInvalid() {
        AddressValidationResponse response = addressValidationService.validateAddress(null);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Address cannot be empty");
    }

    @Test
    void blankAddress_isInvalid() {
        AddressValidationResponse response = addressValidationService.validateAddress("   ");

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Address cannot be empty");
    }

    @Test
    void tooShortAddress_isInvalid() {
        AddressValidationResponse response = addressValidationService.validateAddress("NY");

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Address is too short");
    }

    @Test
    void addressWithNoGeocodingMatches_isInvalid() {
        mockLookupResult(List.of());

        AddressValidationResponse response =
                addressValidationService.validateAddress("Zzzznotarealplace1234");

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).contains("couldn't verify");
    }

    @Test
    void addressWithAGeocodingMatch_isValidAndEnriched() {
        // Nominatim is called with addressdetails=1 (see lookup()), so a
        // real successful match always carries a nested "address" object
        // with the structured components (house_number/road/city/country)
        // that isValidPropertyAddress() inspects. This fixture reflects
        // that real shape instead of only the top-level display fields.
        Map<String, Object> structuredAddress = Map.of(
                "house_number", "221B",
                "road", "Baker Street",
                "city", "London",
                "country", "United Kingdom");
        Map<String, Object> match = Map.of(
                "display_name", "221B, Baker Street, London, NW1, UK",
                "lat", "51.5237",
                "lon", "-0.1585",
                "address", structuredAddress);
        mockLookupResult(List.of(match));

        AddressValidationResponse response =
                addressValidationService.validateAddress("221B Baker Street, London");

        assertThat(response.isValid()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Address verified successfully");
        assertThat(response.getFormattedAddress()).isEqualTo("221B, Baker Street, London, NW1, UK");
        assertThat(response.getLatitude()).isEqualTo(51.5237);
        assertThat(response.getLongitude()).isEqualTo(-0.1585);
    }
}