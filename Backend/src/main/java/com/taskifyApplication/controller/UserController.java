package com.taskifyApplication.controller;

import com.taskifyApplication.dto.UserDto.*;
import com.taskifyApplication.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUser() {
            UserDTO user = userService.getCurrentUserProfile();
            return ResponseEntity.ok(user);
    }

    @PutMapping("/updateUser")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UpdateProfileDTO updateDTO) {
            UserDTO user = userService.updateCurrentUserProfile(updateDTO);
            return ResponseEntity.ok(user);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
            UserStatsDTO stats = userService.getCurrentUserStats();
            return ResponseEntity.ok(stats);
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
            UserSettingsDTO settings = userService.getCurrentUserSettings();
            return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(@Valid @RequestBody UserSettingsDTO settingsDTO) {
            UserSettingsDTO updatedSettings = userService.updateCurrentUserSettings(settingsDTO);
            return ResponseEntity.ok(updatedSettings);
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<?> deleteCurrentUser() {
            userService.deleteCurrentUserProfile();
            return ResponseEntity.ok().build();
    }
}