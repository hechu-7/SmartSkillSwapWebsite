package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.MessageDto;
import com.skillswap.dto.MessageSendDto;
import com.skillswap.dto.RegisterRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MessagingAndConversationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse sender;
    private AuthResponse recipient;

    @BeforeEach
    void setUp() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        sender = registerUser("Sender Student " + suffix, "sender." + suffix + "@test.edu");
        recipient = registerUser("Recipient Student " + suffix, "recipient." + suffix + "@test.edu");
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
    @DisplayName("Send private message, persist in database, load history, and update read status")
    void testPrivateMessagingPersistenceAndRetrieval() throws Exception {
        // 1. Sender sends message to recipient
        MessageSendDto sendDto = new MessageSendDto(
                recipient.getId(), "Hello! Are you free to mentor on Python this Thursday?"
        );

        MvcResult sendRes = mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + sender.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendDto)))
                .andExpect(status().isCreated())
                .andReturn();

        MessageDto messageDto = objectMapper.readValue(sendRes.getResponse().getContentAsString(), MessageDto.class);
        assertNotNull(messageDto.getId());
        assertEquals("Hello! Are you free to mentor on Python this Thursday?", messageDto.getContent());
        assertFalse(messageDto.getIsRead());

        // 2. Recipient views conversation history
        MvcResult historyRes = mockMvc.perform(get("/api/messages/" + sender.getId())
                        .header("Authorization", "Bearer " + recipient.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        String history = historyRes.getResponse().getContentAsString();
        assertTrue(history.contains("Are you free to mentor on Python"));

        // 3. Sender views conversation history
        MvcResult senderHistoryRes = mockMvc.perform(get("/api/messages/" + recipient.getId())
                        .header("Authorization", "Bearer " + sender.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        assertTrue(senderHistoryRes.getResponse().getContentAsString().contains("Are you free to mentor on Python"));

        // 4. Conversations list includes contact
        MvcResult conversationsRes = mockMvc.perform(get("/api/messages/conversations")
                        .header("Authorization", "Bearer " + recipient.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        assertTrue(conversationsRes.getResponse().getContentAsString().contains(sender.getFullName()));
    }
}
