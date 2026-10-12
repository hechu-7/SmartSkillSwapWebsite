package com.skillswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = {"/", "/api"})
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", "UP");
        body.put("service", "SkillSwap Backend API");
        body.put("version", "1.0.0");
        body.put("timestamp", Instant.now().toString());
        body.put("message", "SkillSwap API service is live and healthy.");
        return ResponseEntity.ok(body);
    }

    @GetMapping(value = {"/health", "/api/health"})
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
