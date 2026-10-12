package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthAndUserWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("User A and User B register independently, login, and verify distinct profile identities")
    void testIndependentUserRegistrationAndLogin() throws Exception {
        // 1. Register User A
        RegisterRequest registerUserA = new RegisterRequest(
                "Alice Johnson", "alice.test@university.edu", "Password123!", "Password123!"
        );
        MvcResult resA = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerUserA)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse authA = objectMapper.readValue(resA.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(authA.getToken());
        assertEquals("Alice Johnson", authA.getFullName());
        assertEquals("alice.test@university.edu", authA.getEmail());
        assertEquals(100, authA.getSwapPoints());

        // 2. Prevent duplicate email registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerUserA)))
                .andExpect(status().isConflict());

        // 3. Register User B
        RegisterRequest registerUserB = new RegisterRequest(
                "Bob Smith", "bob.test@university.edu", "SecurePass456!", "SecurePass456!"
        );
        MvcResult resB = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerUserB)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse authB = objectMapper.readValue(resB.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(authB.getToken());
        assertEquals("Bob Smith", authB.getFullName());
        assertEquals("bob.test@university.edu", authB.getEmail());
        assertNotEquals(authA.getId(), authB.getId());

        // 4. Login User A
        LoginRequest loginA = new LoginRequest("alice.test@university.edu", "Password123!");
        MvcResult loginResA = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginA)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponseA = objectMapper.readValue(loginResA.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(loginResponseA.getToken());

        // 5. Verify /api/auth/me returns User A's identity
        MvcResult meResA = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + loginResponseA.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse meA = objectMapper.readValue(meResA.getResponse().getContentAsString(), AuthResponse.class);
        assertEquals("Alice Johnson", meA.getFullName());
        assertEquals("alice.test@university.edu", meA.getEmail());

        // 6. Verify /api/auth/me returns User B's identity when using User B's token
        MvcResult meResB = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + authB.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse meB = objectMapper.readValue(meResB.getResponse().getContentAsString(), AuthResponse.class);
        assertEquals("Bob Smith", meB.getFullName());
        assertEquals("bob.test@university.edu", meB.getEmail());
    }

    @Test
    @DisplayName("Login with invalid password returns 401 Unauthorized")
    void testInvalidPasswordLogin() throws Exception {
        LoginRequest badLogin = new LoginRequest("nonexistent@university.edu", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }
}
