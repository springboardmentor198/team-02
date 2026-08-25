package com.realestate.due_diligence_agent.controller;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test: real HTTP requests through AuthController, the real
 * UserService, and a real (H2, in-memory) database — no mocking of the
 * persistence layer, since the goal is to verify the whole
 * Controller -> Service -> Repository -> Database chain, plus the
 * validation and security behavior added for Milestone 4 Task 4.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private static int counter = 0;

    private String uniqueEmail() {
        return "auth.test." + System.nanoTime() + "." + (counter++) + "@example.com";
    }

    @Test
    void register_withValidData_returns201_andNeverExposesPasswordHash() throws Exception {
        String email = uniqueEmail();
        String body = """
                {"fullName":"Jane Buyer","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.fullName", is("Jane Buyer")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void register_withBlankFullName_returns400_withValidationMessage() throws Exception {
        String body = """
                {"fullName":"","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(uniqueEmail());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        String body = """
                {"fullName":"Jane Buyer","email":"not-an-email","password":"secret123","role":"BUYER"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withShortPassword_returns400() throws Exception {
        String body = """
                {"fullName":"Jane Buyer","email":"%s","password":"123","role":"BUYER"}
                """.formatted(uniqueEmail());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withDuplicateEmail_returns400() throws Exception {
        String email = uniqueEmail();
        String body = """
                {"fullName":"Jane Buyer","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        // Same email again should be rejected
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Email already exists!")));
    }

    @Test
    void login_withCorrectCredentials_returnsToken() throws Exception {
        String email = uniqueEmail();
        String registerBody = """
                {"fullName":"Jane Buyer","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                {"email":"%s","password":"secret123"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.role", is("BUYER")));
    }

    @Test
    void login_withWrongPassword_returnsUnauthorized() throws Exception {
        String email = uniqueEmail();
        String registerBody = """
                {"fullName":"Jane Buyer","email":"%s","password":"secret123","role":"BUYER"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                {"email":"%s","password":"wrong-password"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withUnknownEmail_returnsNotFound() throws Exception {
        String loginBody = """
                {"email":"%s","password":"whatever123"}
                """.formatted(uniqueEmail());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void login_withBlankEmail_returns400() throws Exception {
        String loginBody = """
                {"email":"","password":"whatever123"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isBadRequest());
    }
}
