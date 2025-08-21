package com.taskifyApplication.controller;

import com.taskifyApplication.dto.UserDto.AuthResponseDTO;
import com.taskifyApplication.dto.UserDto.CreateUserRequestDTO;
import com.taskifyApplication.dto.UserDto.LoginRequestDTO;
import com.taskifyApplication.service.AuthService;
import com.taskifyApplication.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

record ForgotPasswordRequest(String email) {}
record ResetPasswordRequest(String token, String newPassword) {}

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;
    private final PasswordResetService service;
    public AuthController(PasswordResetService service){ this.service = service; }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody CreateUserRequestDTO request) {
        try {
            AuthResponseDTO response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            AuthResponseDTO response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgot(@RequestBody ForgotPasswordRequest req) {
            service.startReset(req.email());
            return ResponseEntity.ok().build();
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> reset(@RequestBody ResetPasswordRequest req) {
            service.finishReset(req.token(), req.newPassword());
            return ResponseEntity.ok().build();
        }
}