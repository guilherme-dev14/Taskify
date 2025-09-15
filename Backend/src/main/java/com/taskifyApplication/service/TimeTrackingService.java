package com.taskifyApplication.service;

import com.taskifyApplication.dto.TimeTrackingDto.*;
import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.model.TimeTracking;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.TimeTrackingRepository;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TimeTrackingService {

    @Autowired
    private TimeTrackingRepository timeTrackingRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ValidationService validationService;

    public TimeTrackingResponseDTO startTracking(TimeTrackingRequestDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user has access to the task's workspace
        if (!hasAccessToWorkspace(user, task.getWorkspace().getId())) {
            throw new RuntimeException("Access denied to this workspace");
        }

        // Stop any active sessions for this user
        stopAllActiveSessionsForUser(user.getId());

        // Sanitize description
        String sanitizedDescription = validationService.sanitizeHtml(request.getDescription());

        TimeTracking timeTracking = TimeTracking.builder()
                .task(task)
                .user(user)
                .startTime(OffsetDateTime.now())
                .description(sanitizedDescription)
                .isActive(true)
                .build();

        timeTracking = timeTrackingRepository.save(timeTracking);
        return convertToResponseDTO(timeTracking);
    }

    public TimeTrackingResponseDTO stopTracking(Long timeTrackingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeTracking timeTracking = timeTrackingRepository.findById(timeTrackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking session not found"));

        // Check if user owns this session
        if (!timeTracking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (!timeTracking.getIsActive()) {
            throw new RuntimeException("Session is already stopped");
        }

        timeTracking.setEndTime(OffsetDateTime.now());
        timeTracking.setIsActive(false);
        
        timeTracking = timeTrackingRepository.save(timeTracking);
        return convertToResponseDTO(timeTracking);
    }

    public List<TimeTrackingResponseDTO> getTimeTrackingEntries(Long taskId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!hasAccessToWorkspace(user, task.getWorkspace().getId())) {
            throw new RuntimeException("Access denied to this workspace");
        }

        List<TimeTracking> entries = timeTrackingRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return entries.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public TimeTrackingResponseDTO updateTimeTracking(Long timeTrackingId, TimeTrackingUpdateDTO updateDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeTracking timeTracking = timeTrackingRepository.findById(timeTrackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking session not found"));

        if (!timeTracking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (updateDTO.getStartTime() != null) {
            timeTracking.setStartTime(updateDTO.getStartTime());
        }
        
        if (updateDTO.getEndTime() != null) {
            timeTracking.setEndTime(updateDTO.getEndTime());
            timeTracking.setIsActive(false);
        }
        
        if (updateDTO.getDescription() != null) {
            String sanitizedDescription = validationService.sanitizeHtml(updateDTO.getDescription());
            timeTracking.setDescription(sanitizedDescription);
        }

        timeTracking = timeTrackingRepository.save(timeTracking);
        return convertToResponseDTO(timeTracking);
    }

    public void deleteTimeTracking(Long timeTrackingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeTracking timeTracking = timeTrackingRepository.findById(timeTrackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking session not found"));

        if (!timeTracking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        timeTrackingRepository.delete(timeTracking);
    }

    public TimeTrackingSummaryDTO getTotalTimeSpent(Long taskId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!hasAccessToWorkspace(user, task.getWorkspace().getId())) {
            throw new RuntimeException("Access denied to this workspace");
        }

        Integer totalMinutes = timeTrackingRepository.getTotalDurationByTask(taskId);
        List<TimeTracking> allEntries = timeTrackingRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        int sessionsCount = allEntries.size();
        int activeSessionsCount = (int) allEntries.stream().filter(TimeTracking::getIsActive).count();

        return new TimeTrackingSummaryDTO(totalMinutes, sessionsCount, activeSessionsCount);
    }

    public List<TimeTrackingResponseDTO> getActiveSessionsForUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<TimeTracking> activeSessions = timeTrackingRepository.findActiveSessionsByUser(user.getId());
        return activeSessions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<TimeTrackingResponseDTO> getUserTimeTrackingHistory(OffsetDateTime startDate, OffsetDateTime endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OffsetDateTime start = startDate != null ? startDate : OffsetDateTime.now().minusDays(30);
        OffsetDateTime end = endDate != null ? endDate : OffsetDateTime.now();

        List<TimeTracking> history = timeTrackingRepository.findByUserAndDateRange(user.getId(), start, end);
        return history.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    private void stopAllActiveSessionsForUser(Long userId) {
        List<TimeTracking> activeSessions = timeTrackingRepository.findActiveSessionsByUser(userId);
        for (TimeTracking session : activeSessions) {
            session.setEndTime(OffsetDateTime.now());
            session.setIsActive(false);
            timeTrackingRepository.save(session);
        }
    }

    private boolean hasAccessToWorkspace(User user, Long workspaceId) {
        return user.getWorkspaceMemberships().stream()
                .anyMatch(membership -> membership.getWorkspace().getId().equals(workspaceId));
    }

    private TimeTrackingResponseDTO convertToResponseDTO(TimeTracking timeTracking) {
        TimeTrackingResponseDTO dto = new TimeTrackingResponseDTO();
        dto.setId(timeTracking.getId());
        dto.setStartTime(timeTracking.getStartTime());
        dto.setEndTime(timeTracking.getEndTime());
        dto.setDuration(timeTracking.getDuration());
        dto.setDescription(timeTracking.getDescription());
        dto.setIsActive(timeTracking.getIsActive());
        dto.setCreatedAt(timeTracking.getCreatedAt());
        dto.setUpdatedAt(timeTracking.getUpdatedAt());
        dto.setFormattedDuration(timeTracking.getFormattedDuration());
        dto.setCurrentDuration(timeTracking.getCurrentDuration());

        // Convert task
        TaskResponseDTO taskDto = new TaskResponseDTO();
        taskDto.setId(timeTracking.getTask().getId());
        taskDto.setTitle(timeTracking.getTask().getTitle());
        taskDto.setStatus(timeTracking.getTask().getStatus());
        taskDto.setPriority(timeTracking.getTask().getPriority());
        dto.setTask(taskDto);

        // Convert user
        UserDTO userDto = new UserDTO();
        userDto.setId(timeTracking.getUser().getId());
        userDto.setUsername(timeTracking.getUser().getUsername());
        userDto.setFirstName(timeTracking.getUser().getFirstName());
        userDto.setLastName(timeTracking.getUser().getLastName());
        userDto.setEmail(timeTracking.getUser().getEmail());
        dto.setUser(userDto);

        return dto;
    }
}