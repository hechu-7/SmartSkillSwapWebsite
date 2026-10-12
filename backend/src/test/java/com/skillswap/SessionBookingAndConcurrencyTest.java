package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.*;
import com.skillswap.entity.SessionStatus;
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

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SessionBookingAndConcurrencyTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse mentor;
    private AuthResponse learner1;
    private AuthResponse learner2;

    @BeforeEach
    void setUp() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        mentor = registerUser("Mentor " + suffix, "mentor." + suffix + "@test.edu");
        learner1 = registerUser("Learner One " + suffix, "l1." + suffix + "@test.edu");
        learner2 = registerUser("Learner Two " + suffix, "l2." + suffix + "@test.edu");
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
    @DisplayName("Mentor publishes slot, Learner 1 books it; concurrent booking by Learner 2 fails; Mentor accepts and completes session")
    void testSessionBookingWorkflowAndConcurrency() throws Exception {
        // 1. Mentor publishes availability slot
        LocalDateTime startTime = LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endTime = startTime.plusHours(1);

        AvailabilityCreateDto slotDto = new AvailabilityCreateDto(
                "Distributed SQL on TiDB Mentoring", startTime, endTime
        );

        MvcResult slotRes = mockMvc.perform(post("/api/availability")
                        .header("Authorization", "Bearer " + mentor.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(slotDto)))
                .andExpect(status().isCreated())
                .andReturn();

        AvailabilityDto createdSlot = objectMapper.readValue(slotRes.getResponse().getContentAsString(), AvailabilityDto.class);
        assertNotNull(createdSlot.getId());
        assertFalse(createdSlot.getIsBooked());

        // 2. Learner 1 requests session using this slot
        SessionBookingRequestDto bookDto1 = new SessionBookingRequestDto();
        bookDto1.setMentorId(mentor.getId());
        bookDto1.setAvailabilityId(createdSlot.getId());
        bookDto1.setSkillName("TiDB");
        bookDto1.setStartTime(startTime);
        bookDto1.setEndTime(endTime);
        bookDto1.setNotes("Excited to learn TiDB clustering!");

        MvcResult bookRes1 = mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + learner1.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookDto1)))
                .andExpect(status().isCreated())
                .andReturn();

        SessionDto session1 = objectMapper.readValue(bookRes1.getResponse().getContentAsString(), SessionDto.class);
        assertEquals(SessionStatus.REQUESTED, session1.getStatus());

        // 3. Concurrent booking attempt: Learner 2 tries to book the SAME slot -> 409 Conflict
        SessionBookingRequestDto bookDto2 = new SessionBookingRequestDto();
        bookDto2.setMentorId(mentor.getId());
        bookDto2.setAvailabilityId(createdSlot.getId());
        bookDto2.setSkillName("TiDB");
        bookDto2.setStartTime(startTime);
        bookDto2.setEndTime(endTime);
        bookDto2.setNotes("I want this slot too!");

        mockMvc.perform(post("/api/sessions")
                        .header("Authorization", "Bearer " + learner2.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookDto2)))
                .andExpect(status().isConflict());

        // 4. Unauthorized User (Learner 2) attempts to accept session 1 -> 403 Forbidden
        mockMvc.perform(patch("/api/sessions/" + session1.getId() + "/accept")
                        .header("Authorization", "Bearer " + learner2.getToken()))
                .andExpect(status().isForbidden());

        // 5. Mentor accepts session -> 200 OK & confirmed meeting link generated
        MvcResult acceptRes = mockMvc.perform(patch("/api/sessions/" + session1.getId() + "/accept")
                        .header("Authorization", "Bearer " + mentor.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        SessionDto confirmedSession = objectMapper.readValue(acceptRes.getResponse().getContentAsString(), SessionDto.class);
        assertEquals(SessionStatus.CONFIRMED, confirmedSession.getStatus());
        assertNotNull(confirmedSession.getMeetingLink());

        // 6. Complete session -> Awards SwapPoints to mentor
        MvcResult completeRes = mockMvc.perform(patch("/api/sessions/" + session1.getId() + "/complete")
                        .header("Authorization", "Bearer " + mentor.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        SessionDto completedSession = objectMapper.readValue(completeRes.getResponse().getContentAsString(), SessionDto.class);
        assertEquals(SessionStatus.COMPLETED, completedSession.getStatus());
    }
}
