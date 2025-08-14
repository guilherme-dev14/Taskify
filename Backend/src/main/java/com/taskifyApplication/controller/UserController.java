package com.taskifyApplication.controller;

import com.taskifyApplication.dto.*;
import com.taskifyApplication.dto.UserDto.UpdateProfileDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.model.User;
import com.taskifyApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        try {
            UserDTO user = userService.getCurrentUserProfile();
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/mes")
    public ResponseEntity<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateProfileDTO updateDTO) {
        try {
            UserDTO user = userService.updateCurrentUserProfile(updateDTO);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}