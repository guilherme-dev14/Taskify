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
        try {
            UserDTO user = userService.getCurrentUserProfile();
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/updateUser")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UpdateProfileDTO updateDTO) {
        try {
            UserDTO user = userService.updateCurrentUserProfile(updateDTO);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        try {
            UserStatsDTO stats = userService.getCurrentUserStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
        try {
            UserSettingsDTO settings = userService.getCurrentUserSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(@Valid @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userService.updateCurrentUserSettings(settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            userService.changeCurrentUserPassword(changePasswordDTO);
            return ResponseEntity.ok("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change password");
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportUserData() {
        try {
            byte[] data = userService.exportCurrentUserData();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=taskify-export.json")
                    .header("Content-Type", "application/json")
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<?> deleteCurrentUser() {
        try {
            userService.deleteCurrentUserProfile();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro ao deletar perfil", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}