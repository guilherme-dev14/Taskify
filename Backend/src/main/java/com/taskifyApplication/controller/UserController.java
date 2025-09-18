package com.taskifyApplication.controller;

import com.taskifyApplication.dto.UserDto.*;
import com.taskifyApplication.dto.ErrorResponseDTO;
import com.taskifyApplication.model.User;
import com.taskifyApplication.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserService userService;

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

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
            userService.changeCurrentUserPassword(changePasswordDTO);
            return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportUserData() throws Exception {
            byte[] data = userService.exportCurrentUserData();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=taskify-export.json")
                    .header("Content-Type", "application/json")
                    .body(data);
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<?> deleteCurrentUser() {
            userService.deleteCurrentUserProfile();
            return ResponseEntity.ok().build();
    }
}