package com.taskifyApplication.service;

import com.taskifyApplication.dto.activity.ActivityDto;
import com.taskifyApplication.model.Activity;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.ActivityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Create a new activity
    public Activity createActivity(String type, String title, String description, 
                                  User user, Task task, Workspace workspace, Map<String, Object> metadata) {
        Activity activity = new Activity(type, title, description, user);
        activity.setTask(task);
        activity.setWorkspace(workspace);
        
        if (metadata != null && !metadata.isEmpty()) {
            try {
                String metadataJson = objectMapper.writeValueAsString(metadata);
                activity.setMetadata(metadataJson);
            } catch (Exception e) {
                // Log error and continue without metadata
                System.err.println("Failed to serialize metadata: " + e.getMessage());
            }
        }

        Activity savedActivity = activityRepository.save(activity);
        
        // Send real-time update via WebSocket
        ActivityDto activityDto = convertToDto(savedActivity);
        messagingTemplate.convertAndSend("/topic/activities", activityDto);
        
        if (workspace != null) {
            messagingTemplate.convertAndSend("/topic/workspace/" + workspace.getId() + "/activities", activityDto);
        }

        return savedActivity;
    }

    // Get activities with pagination
    public Page<ActivityDto> getActivities(Long workspaceId, Long userId, String type, 
                                          LocalDateTime startDate, LocalDateTime endDate, 
                                          int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Activity> activities;

        if (startDate != null && endDate != null) {
            if (workspaceId != null) {
                activities = activityRepository.findByWorkspaceIdAndCreatedAtBetween(
                        workspaceId, startDate, endDate, pageable);
            } else if (userId != null) {
                activities = activityRepository.findByUserIdAndCreatedAtBetween(
                        userId, startDate, endDate, pageable);
            } else {
                activities = activityRepository.findByCreatedAtBetween(startDate, endDate, pageable);
            }
        } else if (workspaceId != null && userId != null) {
            activities = activityRepository.findByUserIdAndWorkspaceIdOrderByCreatedAtDesc(
                    userId, workspaceId, pageable);
        } else if (workspaceId != null) {
            activities = activityRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        } else if (userId != null) {
            activities = activityRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if (type != null) {
            activities = activityRepository.findByTypeOrderByCreatedAtDesc(type, pageable);
        } else {
            activities = activityRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return activities.map(this::convertToDto);
    }

    // Get recent activities (for dashboard)
    public List<ActivityDto> getRecentActivities(int limit) {
        List<Activity> activities = activityRepository.findRecentActivities(limit);
        return activities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get activities by task
    public List<ActivityDto> getTaskActivities(Long taskId) {
        List<Activity> activities = activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return activities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get activity statistics
    public Map<String, Long> getActivityStats(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Long> stats = new HashMap<>();
        
        String[] activityTypes = {
            "task_created", "task_updated", "task_completed", "task_deleted",
            "comment_added", "user_joined", "timer_started", "timer_stopped"
        };

        for (String type : activityTypes) {
            Long count = activityRepository.countByTypeAndCreatedAtBetween(type, startDate, endDate);
            stats.put(type, count);
        }

        return stats;
    }

    // Mark activity as read (for notifications)
    public void markAsRead(Long activityId) {
        // This would be implemented if we had a read status field
        // For now, it's a placeholder for the frontend API
    }

    // Clear all activities for a user
    @Transactional
    public void clearUserActivities(Long userId) {
        activityRepository.deleteByUserId(userId);
    }

    // Helper method to convert Activity to ActivityDto
    private ActivityDto convertToDto(Activity activity) {
        ActivityDto.UserDto userDto = new ActivityDto.UserDto(
                activity.getUser().getId(),
                activity.getUser().getName(),
                activity.getUser().getAvatar()
        );

        return new ActivityDto(
                activity.getId(),
                activity.getType(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getCreatedAt(),
                userDto,
                activity.getMetadata()
        );
    }

    // Helper methods for common activity types
    public Activity logTaskCreated(Task task, User user) {
        return createActivity(
                "task_created",
                "Task Created",
                "Created task: " + task.getTitle(),
                user,
                task,
                task.getWorkspace(),
                Map.of("taskId", task.getId())
        );
    }

    public Activity logTaskUpdated(Task task, User user) {
        return createActivity(
                "task_updated",
                "Task Updated",
                "Updated task: " + task.getTitle(),
                user,
                task,
                task.getWorkspace(),
                Map.of("taskId", task.getId())
        );
    }

    public Activity logTaskCompleted(Task task, User user) {
        return createActivity(
                "task_completed",
                "Task Completed",
                "Completed task: " + task.getTitle(),
                user,
                task,
                task.getWorkspace(),
                Map.of("taskId", task.getId())
        );
    }

    public Activity logTaskDeleted(Task task, User user) {
        return createActivity(
                "task_deleted",
                "Task Deleted",
                "Deleted task: " + task.getTitle(),
                user,
                task,
                task.getWorkspace(),
                Map.of("taskId", task.getId())
        );
    }

    public Activity logUserJoined(User user, Workspace workspace) {
        return createActivity(
                "user_joined",
                "User Joined",
                user.getName() + " joined the workspace",
                user,
                null,
                workspace,
                Map.of("workspaceId", workspace.getId())
        );
    }

    public Activity logCommentAdded(Task task, User user, String comment) {
        return createActivity(
                "comment_added",
                "Comment Added",
                "Added comment on: " + task.getTitle(),
                user,
                task,
                task.getWorkspace(),
                Map.of("taskId", task.getId(), "comment", comment)
        );
    }
}