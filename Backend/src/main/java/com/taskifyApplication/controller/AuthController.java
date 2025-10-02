package com.taskifyApplication.controller;

import com.taskifyApplication.annotation.RateLimit;
import com.taskifyApplication.dto.UserDto.AuthResponseDTO;
import com.taskifyApplication.dto.UserDto.CreateUserRequestDTO;
import com.taskifyApplication.dto.UserDto.LoginRequestDTO;
import com.taskifyApplication.service.AuthService;
import com.taskifyApplication.service.PasswordResetService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.taskifyApplication.dto.PasswordDto.ResetPasswordRequest;
import com.taskifyApplication.dto.PasswordDto.ForgotPasswordRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @RateLimit(requests = 3, timeWindow = 300, keyPrefix = "register") // 3 registrations per 5 minutes
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody CreateUserRequestDTO request, HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.register(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @RateLimit(requests = 5, timeWindow = 300, keyPrefix = "login") // 5 attempts per 5 minutes
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request, HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/forgot-password")
    @RateLimit(requests = 3, timeWindow = 600, keyPrefix = "forgot-password") // 3 attempts per 10 minutes
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        passwordResetService.startReset(req.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @RateLimit(requests = 5, timeWindow = 300, keyPrefix = "reset-password") // 5 attempts per 5 minutes
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest req) {
        passwordResetService.finishReset(req.token(), req.newPassword());
        return ResponseEntity.ok().build();
    }
}