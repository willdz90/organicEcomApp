package com.organicecom.aliexpress.controller;

import com.organicecom.aliexpress.service.AliExpressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AliExpressService aliExpressService;

    @GetMapping("/url")
    public ResponseEntity<String> getAuthUrl() {
        String url = aliExpressService.getAuthUrl();
        return ResponseEntity.ok(url);
    }

    @PostMapping("/token")
    public ResponseEntity<?> getToken(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null) {
            return ResponseEntity.badRequest().body("Code is required");
        }
        try {
            // Returns the full response from AliExpress
            Object result = aliExpressService.exchangeToken(code);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error exchanging token: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refresh_token");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("refresh_token is required");
        }
        try {
            Object result = aliExpressService.refreshToken(refreshToken);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error refreshing token: " + e.getMessage());
        }
    }
}
