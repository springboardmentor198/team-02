package com.realestate.due_diligence_agent.workflow;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
 * System/workflow test for the real, end-to-end business flow in this
 * codebase, confirmed against PropertyController, RiskAssessmentController,
 * and DueDiligenceReportController:
 *
 *   Register -> Login -> Add Property -> Verify Property
 *            -> Generate Risk Assessment -> Generate Due Diligence Report
 *
 * Every step goes through the real HTTP layer, real services, and a real
 * (H2, in-memory) database. @Transactional rolls back this test's writes
 * afterward so it can't leak data into other test classes' assertions
 * (property reads are marketplace-wide, not per-user).
 *
 * The one exception is AddressValidationService (@MockitoBean below), which
 * is stubbed to always report the submitted address as valid. That service
 * calls a live third-party geocoder (Nominatim/OpenStreetMap) — an external
 * dependency outside the workflow this test exists to exercise, and one
 * whose live classification of a fixture address this test should not be at
 * the mercy of (confirmed live: it rejected this test's own fixture address
 * as "not sufficiently specific").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DueDiligenceWorkflowSystemTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AddressValidationService addressValidationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    @Test
    void fullDueDiligenceWorkflow_fromRegistrationToReportGeneration() throws Exception {

        // ---------------------------------------------------------
        // Step 1: Register a new seller
        // ---------------------------------------------------------
        String email = "workflow.test." + System.nanoTime() + "@example.com";
        String registerBody = """
                {"fullName":"Workflow Tester","email":"%s","password":"secret123","role":"AGENT"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        // ---------------------------------------------------------
        // Step 2: Login
        // ---------------------------------------------------------
        String loginBody = """
                {"email":"%s","password":"secret123"}
                """.formatted(email);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        // ---------------------------------------------------------
        // Step 3: Add a property
        // ---------------------------------------------------------
        String propertyBody = """
                {
                  "title": "Workflow Test Property",
                  "address": "42 Wallaby Way",
                  "city": "Sydney",
                  "state": "NSW",
                  "propertyType": "Residential",
                  "price": 850000,
                  "area": 1400,
                  "ownerName": "Workflow Tester"
                }
                """;

        MvcResult propertyResult = mockMvc.perform(post("/api/properties")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(propertyBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("Pending")))
                .andReturn();

        long propertyId = objectMapper.readTree(propertyResult.getResponse().getContentAsString())
                .get("id").asLong();

        // ---------------------------------------------------------
        // Step 4: Verify the property
        // ---------------------------------------------------------
        mockMvc.perform(post("/api/properties/" + propertyId + "/verify")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", notNullValue()));

        // Confirm the property record itself reflects the verification result
        mockMvc.perform(get("/api/properties/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationScore", notNullValue()));

        // ---------------------------------------------------------
        // Step 5: Generate a risk assessment for the property
        // ---------------------------------------------------------
        mockMvc.perform(post("/api/risk/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId", is((int) propertyId)))
                .andExpect(jsonPath("$.riskLevel", notNullValue()))
                .andExpect(jsonPath("$.totalScore", notNullValue()));

        // Fetching it back should return the same assessment
        mockMvc.perform(get("/api/risk/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskLevel", notNullValue()));

        // ---------------------------------------------------------
        // Step 6: Generate the due diligence report
        // ---------------------------------------------------------
        mockMvc.perform(get("/api/reports/" + propertyId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId", is((int) propertyId)))
                .andExpect(jsonPath("$.propertyTitle", is("Workflow Test Property")));
    }

    @Test
    void workflow_withoutAuthentication_isRejectedAtEveryStep() throws Exception {
        // A non-existent, arbitrary property id is fine here — the point is
        // that the request must be rejected before it ever reaches the
        // service/repository layer.
        mockMvc.perform(post("/api/properties/1/verify"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/risk/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/reports/1"))
                .andExpect(status().isUnauthorized());
    }
}