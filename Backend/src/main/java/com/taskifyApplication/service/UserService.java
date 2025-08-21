package com.taskifyApplication.service;

import com.taskifyApplication.dto.UserDto.UpdateProfileDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    // region REPOSITORIES
    @Autowired
    private UserRepository userRepository;
    // endregion

    // region PUBLIC FUNCTIONS
    public UserDTO getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return convertToProfileDTO(user);
    }
    public void deleteCurrentUserProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }
    public UserDTO updateCurrentUserProfile(UpdateProfileDTO updateDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));


        if (!user.getUsername().equals(updateDTO.getUsername()) &&
                userRepository.existsByUsername(updateDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        user.setUsername(updateDTO.getUsername());
        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());

        user = userRepository.save(user);
        return convertToProfileDTO(user);
    }
    // endregion

    // region PRIVATE FUNCTIONS
    private UserDTO convertToProfileDTO(User user) {
        return getUserDTO(user);
    }

    static UserDTO getUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setCreatedAt(user.getCreatedAt().toOffsetDateTime());
        return dto;
    }
    // endregion
}