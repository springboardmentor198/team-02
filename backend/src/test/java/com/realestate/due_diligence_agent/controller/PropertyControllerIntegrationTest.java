package com.realestate.due_diligence_agent.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.due_diligence_agent.dto.AddressValidationResponse;
import com.realestate.due_diligence_agent.service.AddressValidationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration test: real HTTP requests through PropertyController, the real
 * PropertyService, and a real (H2, in-memory) database. Covers the
 * Controller -> Service -> Repository -> Database chain for property CRUD,
 * plus the authentication/authorization behavior from Milestone 4 Task 4
 * (no-auth rejection, cross-role rejection).
 *
 * Property visibility is a shared marketplace model: any authenticated user
 * can browse/search/view any listed property (that's the point of a due
 * diligence tool for buyers). Only mutations (verify/update/delete) are
 * restricted to the property's owner.
 *
 * @Transactional rolls back each test method's DB writes afterward. This
 * matters now that reads are marketplace-wide rather than per-user-scoped:
 * without it, properties created by one test method (e.g. several "London"
 * listings) would leak into another test method's city-filter assertions.
 *
 * AddressValidationService is stubbed out (@MockitoBean below). Everything
 * else in the Controller -> Service -> Repository -> Database chain this
 * class is meant to cover (per the paragraph above) still runs for real;
 * only the outbound call to the live Nominatim/OpenStreetMap geocoder is
 * replaced. That call is a third-party dependency outside this chain, and
 * its live classification of a fixture address (e.g. whether OSM happens to
 * have full house-number/road/city/country tags for that exact string) is
 * not something a Controller/Service/DB test should be at the mercy of —
 * confirmed by real Nominatim rejecting even a genuine, well-known address
 * ("221B Baker Street, London") as "not sufficiently specific".
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PropertyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AddressValidationService addressValidationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static int counter = 0;

    @BeforeEach
    void stubAddressValidationAsAlwaysValid() {
        when(addressValidationService.validateAddress(anyString()))
                .thenAnswer(invocation -> {
                    String address = invocation.getArgument(0);
                    AddressValidationResponse response =
                            new AddressValidationResponse(true, "Address verified successfully");
                    response.setFormattedAddress(address);
                    return response;
                });
    }

    private String uniqueEmail() {
        return "property.test." + System.nanoTime() + "." + (counter++) + "@example.com";
    }

    /** Registers a fresh BUYER user and returns their JWT. */
    private String registerAndLogin() throws Exception {
        String email = uniqueEmail();
        String registerBody = """
                {"fullName":"Property Tester","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                {"email":"%s","password":"secret123"}
                """.formatted(email);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    private String samplePropertyRequest(String title) {
        return """
                {
                  "title": "%s",
                  "address": "221B Baker Street",
                  "city": "London",
                  "state": "Greater London",
                  "propertyType": "Residential",
                  "price": 500000,
                  "area": 1200,
                  "ownerName": "John Doe"
                }
                """.formatted(title);
    }

    @Test
    void addProperty_thenGetById_returnsPersistedProperty() throws Exception {
        String token = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Baker Street Flat")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Baker Street Flat")))
                .andExpect(jsonPath("$.verificationStatus", is("Pending")))
                .andReturn();

        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long propertyId = created.get("id").asLong();

        mockMvc.perform(get("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Baker Street Flat")))
                .andExpect(jsonPath("$.city", is("London")));
    }

    @Test
    void addProperty_withoutRequiredFields_returns400() throws Exception {
        String token = registerAndLogin();

        String invalidBody = """
                {"title": "", "address": "", "city": "London"}
                """;

        mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProperty_persistsChanges() throws Exception {
        String token = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Original Title")))
                .andExpect(status().isOk())
                .andReturn();

        long propertyId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(put("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Updated Title")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")));
    }

    @Test
    void deleteProperty_removesIt_subsequentGetReturns404() throws Exception {
        String token = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("To Be Deleted")))
                .andExpect(status().isOk())
                .andReturn();

        long propertyId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(delete("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void getPropertiesByCity_filtersCorrectly_usingDbQuery() throws Exception {
        String token = registerAndLogin();

        mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("London Flat")))
                .andExpect(status().isOk());

        String parisProperty = """
                {
                  "title": "Paris Apartment",
                  "address": "1 Rue de Rivoli",
                  "city": "Paris",
                  "state": "Ile-de-France",
                  "propertyType": "Residential",
                  "price": 700000,
                  "area": 900,
                  "ownerName": "Marie Curie"
                }
                """;
        mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(parisProperty))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/properties/city/London")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].city", is("London")));

        mockMvc.perform(get("/api/properties/city/london") // case-insensitive
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // ------------------------------------------------------------
    // Security cases (Milestone 4 Task 4)
    // ------------------------------------------------------------

    @Test
    void request_withoutAuthentication_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/properties"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void request_withInvalidToken_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/properties")
                        .header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void buyerAccessingAdminEndpoint_isRejectedWith403() throws Exception {
        String token = registerAndLogin(); // registers as BUYER

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void anyAuthenticatedUser_canViewAnotherUsersProperty() throws Exception {
        String ownerToken = registerAndLogin();
        String otherUserToken = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Marketplace Listing")))
                .andExpect(status().isOk())
                .andReturn();

        long propertyId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // A different, unrelated user should still be able to view it —
        // that's the point of a shared due-diligence marketplace.
        mockMvc.perform(get("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Marketplace Listing")));
    }

    @Test
    void onlyOwner_canUpdateOrDeleteAProperty() throws Exception {
        String ownerToken = registerAndLogin();
        String otherUserToken = registerAndLogin();

        MvcResult createResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Owner-Only Edit Test")))
                .andExpect(status().isOk())
                .andReturn();

        long propertyId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // A non-owner cannot edit ...
        mockMvc.perform(put("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + otherUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Hijacked Title")))
                .andExpect(status().isNotFound()); // findByIdAndUser scopes the lookup itself

        // ... or delete someone else's listing.
        mockMvc.perform(delete("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isForbidden());

        // The owner still can.
        mockMvc.perform(put("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(samplePropertyRequest("Legitimate Update")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Legitimate Update")));
    }
}