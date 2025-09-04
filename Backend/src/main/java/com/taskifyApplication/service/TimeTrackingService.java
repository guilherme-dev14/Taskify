package com.taskifyApplication.service;

import com.taskifyApplication.dto.TimeTrackingDto.*;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TimeTracking;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.TimeTrackingRepository;
import com.taskifyApplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private WebSocketService webSocketService;

    public TimeTrackingResponseDTO startTimeTracking(StartTimeTrackingDTO startDTO) {
        User currentUser = getCurrentUser();
        
        // Check if user already has an active time tracking session
        Optional<TimeTracking> activeEntry = timeTrackingRepository.findByUserAndIsActiveTrue(currentUser);
        if (activeEntry.isPresent()) {
            throw new IllegalStateException("You already have an active time tracking session. Stop it first.");
        }
        
        Task task = taskRepository.findById(startDTO.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        // Verify user has access to this task
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have access to this task");
        }
        
        TimeTracking timeTracking = TimeTracking.builder()
                .task(task)
                .user(currentUser)
                .description(startDTO.getDescription())
                .isActive(true)
                .startTime(OffsetDateTime.now())
                .build();
        
        timeTracking = timeTrackingRepository.save(timeTracking);
        
        // Notify workspace members that user started working on task
        webSocketService.notifyWorkspaceActivity(
            task.getWorkspace().getId(),
            "Started working on task: " + task.getTitle(),
            currentUser
        );
        
        return convertToTimeTrackingResponseDto(timeTracking);
    }
    
    public TimeTrackingResponseDTO stopTimeTracking() {
        User currentUser = getCurrentUser();
        
        TimeTracking activeEntry = timeTrackingRepository.findByUserAndIsActiveTrue(currentUser)
                .orElseThrow(() -> new IllegalStateException("No active time tracking session found"));
        
        activeEntry.stop();
        activeEntry = timeTrackingRepository.save(activeEntry);
        
        // Update task actual hours
        updateTaskActualHours(activeEntry.getTask());
        
        // Notify workspace members
        webSocketService.notifyWorkspaceActivity(
            activeEntry.getTask().getWorkspace().getId(),
            "Finished working on task: " + activeEntry.getTask().getTitle() + 
            " (" + formatDuration(activeEntry.getDuration()) + ")",
            currentUser
        );
        
        return convertToTimeTrackingResponseDto(activeEntry);
    }
    
    public TimeTrackingResponseDTO getActiveTimeTracking() {
        User currentUser = getCurrentUser();
        
        Optional<TimeTracking> activeEntry = timeTrackingRepository.findByUserAndIsActiveTrue(currentUser);
        return activeEntry.map(this::convertToTimeTrackingResponseDto).orElse(null);
    }
    
    public PageResponse<TimeTrackingResponseDTO> getUserTimeTrackingHistory(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        Page<TimeTracking> trackingPage = timeTrackingRepository.findByTaskOrderByStartTimeDesc(null, pageable);
        
        List<TimeTrackingResponseDTO> trackingList = trackingPage.getContent().stream()
                .filter(tt -> tt.getUser().equals(currentUser))
                .map(this::convertToTimeTrackingResponseDto)
                .collect(Collectors.toList());
        
        return PageResponse.<TimeTrackingResponseDTO>builder()
                .content(trackingList)
                .page(trackingPage.getNumber())
                .size(trackingPage.getSize())
                .totalElements(trackingPage.getTotalElements())
                .totalPages(trackingPage.getTotalPages())
                .first(trackingPage.isFirst())
                .last(trackingPage.isLast())
                .empty(trackingPage.isEmpty())
                .build();
    }
    
    public List<TimeTrackingResponseDTO> getTaskTimeTrackingHistory(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have access to this task");
        }
        
        List<TimeTracking> trackingList = timeTrackingRepository.findByTaskOrderByStartTimeDesc(task);
        
        return trackingList.stream()
                .map(this::convertToTimeTrackingResponseDto)
                .collect(Collectors.toList());
    }
    
    public TimeReportDTO generateUserTimeReport(OffsetDateTime startDate, OffsetDateTime endDate) {
        User currentUser = getCurrentUser();
        
        Long totalMinutes = timeTrackingRepository.getTotalTimeSpentByUserInPeriod(currentUser, startDate, endDate);
        if (totalMinutes == null) totalMinutes = 0L;
        
        List<TimeTracking> entries = timeTrackingRepository.findByWorkspaceAndDateRange(null, startDate, endDate)
                .stream()
                .filter(tt -> tt.getUser().equals(currentUser))
                .collect(Collectors.toList());
        
        List<TimeTrackingResponseDTO> entryDTOs = entries.stream()
                .map(this::convertToTimeTrackingResponseDto)
                .collect(Collectors.toList());
        
        // Group by task for breakdown
        Map<Long, List<TimeTracking>> taskGroups = entries.stream()
                .collect(Collectors.groupingBy(tt -> tt.getTask().getId()));
        
        List<TaskTimeReportDTO> taskBreakdown = taskGroups.entrySet().stream()
                .map(entry -> {
                    Long taskId = entry.getKey();
                    List<TimeTracking> taskEntries = entry.getValue();
                    
                    TimeTracking firstEntry = taskEntries.get(0);
                    Long taskTotalMinutes = taskEntries.stream()
                            .mapToLong(tt -> tt.getDuration() != null ? tt.getDuration() : 0)
                            .sum();
                    
                    return TaskTimeReportDTO.builder()
                            .taskId(taskId)
                            .taskTitle(firstEntry.getTask().getTitle())
                            .taskStatus(firstEntry.getTask().getStatus().toString())
                            .totalMinutes(taskTotalMinutes)
                            .totalTimeFormatted(formatDuration(taskTotalMinutes.intValue()))
                            .sessionCount(taskEntries.size())
                            .workspaceName(firstEntry.getTask().getWorkspace().getName())
                            .build();
                })
                .collect(Collectors.toList());
        
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double averageHoursPerDay = totalMinutes > 0 ? (totalMinutes / 60.0) / daysBetween : 0;
        
        return TimeReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalMinutes(totalMinutes)
                .totalTimeFormatted(formatDuration(totalMinutes.intValue()))
                .totalDays((int) daysBetween)
                .averageHoursPerDay(Math.round(averageHoursPerDay * 100.0) / 100.0)
                .entries(entryDTOs)
                .taskBreakdown(taskBreakdown)
                .build();
    }
    
    public void deleteTimeEntry(Long entryId) {
        User currentUser = getCurrentUser();
        
        TimeTracking entry = timeTrackingRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Time entry not found"));
        
        if (!entry.getUser().equals(currentUser) && 
            !entry.getTask().getWorkspace().getUserRole(currentUser).name().equals("ADMIN") &&
            !entry.getTask().getWorkspace().getUserRole(currentUser).name().equals("OWNER")) {
            throw new IllegalArgumentException("You don't have permission to delete this time entry");
        }
        
        Task task = entry.getTask();
        timeTrackingRepository.delete(entry);
        
        // Update task actual hours after deletion
        updateTaskActualHours(task);
    }
    
    private void updateTaskActualHours(Task task) {
        Long totalMinutes = timeTrackingRepository.getTotalTimeSpentOnTask(task);
        if (totalMinutes != null) {
            task.setActualHours((int) (totalMinutes / 60));
            taskRepository.save(task);
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    private TimeTrackingResponseDTO convertToTimeTrackingResponseDto(TimeTracking timeTracking) {
        TimeTrackingResponseDTO dto = new TimeTrackingResponseDTO();
        dto.setId(timeTracking.getId());
        dto.setTaskId(timeTracking.getTask().getId());
        dto.setTaskTitle(timeTracking.getTask().getTitle());
        dto.setUserId(timeTracking.getUser().getId());
        dto.setUserName(timeTracking.getUser().getFirstName() + " " + timeTracking.getUser().getLastName());
        dto.setStartTime(timeTracking.getStartTime());
        dto.setEndTime(timeTracking.getEndTime());
        dto.setDuration(timeTracking.getDuration());
        dto.setDescription(timeTracking.getDescription());
        dto.setIsActive(timeTracking.getIsActive());
        dto.setWorkspaceName(timeTracking.getTask().getWorkspace().getName());
        dto.setWorkspaceId(timeTracking.getTask().getWorkspace().getId());
        return dto;
    }
    
    private String formatDuration(Integer minutes) {
        if (minutes == null || minutes == 0) {
            return "0m";
        }
        
        int hours = minutes / 60;
        int remainingMinutes = minutes % 60;
        
        if (hours == 0) {
            return remainingMinutes + "m";
        } else if (remainingMinutes == 0) {
            return hours + "h";
        } else {
            return hours + "h " + remainingMinutes + "m";
        }
    }
}