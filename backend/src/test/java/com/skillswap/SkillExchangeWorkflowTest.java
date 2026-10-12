package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.dto.SkillRequestCreateDto;
import com.skillswap.dto.SkillRequestDto;
import com.skillswap.entity.RequestStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SkillExchangeWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse userA;
    private AuthResponse userB;
    private AuthResponse userC;

    @BeforeEach
    void setUp() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        userA = registerUser("Dev Alpha " + suffix, "alpha." + suffix + "@test.edu");
        userB = registerUser("Dev Beta " + suffix, "beta." + suffix + "@test.edu");
        userC = registerUser("Dev Gamma " + suffix, "gamma." + suffix + "@test.edu");
    }

    private AuthResponse registerUser(String name, String email) throws Exception {
        RegisterRequest req = new RegisterRequest(name, email, "Pass1234!", "Pass1234!");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
    }

    @Test
    @DisplayName("User A sends exchange request, User B receives and accepts it, prevents duplicate and unauthorized accept")
    void testExchangeRequestWorkflow() throws Exception {
        // 1. User A sends skill exchange request to User B
        SkillRequestCreateDto createDto = new SkillRequestCreateDto(
                userB.getId(), "Machine Learning", "React", "Hey, let's exchange knowledge!"
        );

        MvcResult createRes = mockMvc.perform(post("/api/skill-requests")
                        .header("Authorization", "Bearer " + userA.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        SkillRequestDto requestDto = objectMapper.readValue(createRes.getResponse().getContentAsString(), SkillRequestDto.class);
        assertNotNull(requestDto.getId());
        assertEquals(RequestStatus.PENDING, requestDto.getStatus());
        assertEquals("Machine Learning", requestDto.getRequestedSkill());

        // 2. Prevent duplicate pending request
        mockMvc.perform(post("/api/skill-requests")
                        .header("Authorization", "Bearer " + userA.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isConflict());

        // 3. User B sees the request in received requests
        MvcResult receivedRes = mockMvc.perform(get("/api/skill-requests/received")
                        .header("Authorization", "Bearer " + userB.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        String receivedContent = receivedRes.getResponse().getContentAsString();
        assertTrue(receivedContent.contains("Machine Learning"));

        // 4. Unauthorized User C attempts to accept User B's request -> 403 Forbidden
        mockMvc.perform(patch("/api/skill-requests/" + requestDto.getId() + "/accept")
                        .header("Authorization", "Bearer " + userC.getToken()))
                .andExpect(status().isForbidden());

        // 5. Intended recipient User B accepts the request -> 200 OK
        MvcResult acceptRes = mockMvc.perform(patch("/api/skill-requests/" + requestDto.getId() + "/accept")
                        .header("Authorization", "Bearer " + userB.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        SkillRequestDto acceptedDto = objectMapper.readValue(acceptRes.getResponse().getContentAsString(), SkillRequestDto.class);
        assertEquals(RequestStatus.ACCEPTED, acceptedDto.getStatus());
    }
}
