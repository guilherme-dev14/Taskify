package com.taskifyApplication.service;

import com.taskifyApplication.dto.UserDto.UpdateProfileDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.dto.UserDto.UserStatsDTO;
import com.taskifyApplication.dto.UserDto.UserSettingsDTO;
import com.taskifyApplication.dto.UserDto.ChangePasswordDTO;
import com.taskifyApplication.exception.DuplicateResourceException;
import com.taskifyApplication.exception.InvalidFormatException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.UserSettings;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class UserService {
    // region REPOSITORIES
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserSettingsRepository userSettingsRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    // endregion

    // region PUBLIC FUNCTIONS
    public UserDTO getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return convertToProfileDTO(user);
    }
    public void deleteCurrentUserProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }
    public UserDTO updateCurrentUserProfile(UpdateProfileDTO updateDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        if (!user.getUsername().equals(updateDTO.getUsername()) &&
                userRepository.existsByUsername(updateDTO.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }

        user.setUsername(updateDTO.getUsername());
        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());
        if (updateDTO.getBio() != null) user.setBio(updateDTO.getBio());
        if (updateDTO.getLocation() != null) user.setLocation(updateDTO.getLocation());
        if (updateDTO.getWebsite() != null) user.setWebsite(updateDTO.getWebsite());

        user = userRepository.save(user);
        return convertToProfileDTO(user);
    }

    public UserStatsDTO getCurrentUserStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserStatsDTO stats = new UserStatsDTO();
        stats.setTasksCompleted((int) user.getAssignedTasks().stream()
                .filter(task -> "COMPLETED".equals(task.getStatus()))
                .count());
        stats.setProjectsActive(user.getWorkspaceMemberships().size());
        stats.setTeamMembers((int) user.getWorkspaceMemberships().stream()
                .mapToInt(membership -> membership.getWorkspace().getMembers().size())
                .sum());
        stats.setTotalWorkspaces(user.getWorkspaceMemberships().size());
        
        return stats;
    }

    public UserSettingsDTO getCurrentUserSettings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));

        return convertToSettingsDTO(settings);
    }

    public UserSettingsDTO updateCurrentUserSettings(UserSettingsDTO settingsDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));

        if (settingsDTO.getTheme() != null) settings.setTheme(settingsDTO.getTheme());
        if (settingsDTO.getLanguage() != null) settings.setLanguage(settingsDTO.getLanguage());
        if (settingsDTO.getEmailNotifications() != null) settings.setEmailNotifications(settingsDTO.getEmailNotifications());
        if (settingsDTO.getPushNotifications() != null) settings.setPushNotifications(settingsDTO.getPushNotifications());
        if (settingsDTO.getWeeklyReports() != null) settings.setWeeklyReports(settingsDTO.getWeeklyReports());
        if (settingsDTO.getTaskReminders() != null) settings.setTaskReminders(settingsDTO.getTaskReminders());
        if (settingsDTO.getTeamUpdates() != null) settings.setTeamUpdates(settingsDTO.getTeamUpdates());

        settings = userSettingsRepository.save(settings);
        return convertToSettingsDTO(settings);
    }

    public void changeCurrentUserPassword(ChangePasswordDTO changePasswordDTO) {
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new InvalidFormatException("Password confirmation does not match");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            throw new InvalidFormatException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }
    // endregion

    // region ADDITIONAL METHODS
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    // endregion

    // region PRIVATE FUNCTIONS
    private UserDTO convertToProfileDTO(User user) {
        return getUserDTO(user);
    }

    private UserSettings createDefaultSettings(User user) {
        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();
        return userSettingsRepository.save(settings);
    }

    private UserSettingsDTO convertToSettingsDTO(UserSettings settings) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.setTheme(settings.getTheme());
        dto.setLanguage(settings.getLanguage());
        dto.setEmailNotifications(settings.getEmailNotifications());
        dto.setPushNotifications(settings.getPushNotifications());
        dto.setWeeklyReports(settings.getWeeklyReports());
        dto.setTaskReminders(settings.getTaskReminders());
        dto.setTeamUpdates(settings.getTeamUpdates());
        return dto;
    }

    static UserDTO getUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setBio(user.getBio());
        dto.setLocation(user.getLocation());
        dto.setWebsite(user.getWebsite());
        dto.setCreatedAt(user.getCreatedAt().toOffsetDateTime());
        return dto;
    }

    // endregion
}