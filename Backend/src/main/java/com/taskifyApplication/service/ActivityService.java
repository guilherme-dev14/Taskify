package com.taskifyApplication.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.taskifyApplication.dto.activity.ActivityDto;
import com.taskifyApplication.exception.BadRequestException;
import com.taskifyApplication.model.Activity;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.ActivityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskifyApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.ResourceNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    public Activity createActivity(String type, String title, String description,
                                   User user, Task task, Workspace workspace, Map<String, Object> metadata) {
        Activity activity = new Activity(type, title, description, user);
        activity.setTask(task);
        activity.setWorkspace(workspace);

        if (metadata != null && !metadata.isEmpty()) {
            try {
                activity.setMetadata(objectMapper.writeValueAsString(metadata));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize activity metadata for type '{}'", type, e);
                throw new BadRequestException("Invalid metadata format provided for activity.");
            }
        }

        Activity savedActivity = activityRepository.save(activity);

        sendRealTimeUpdate(savedActivity);

        return savedActivity;
    }
    private void sendRealTimeUpdate(Activity activity) {
        try {
            ActivityDto activityDto = convertToDto(activity);
            messagingTemplate.convertAndSend("/topic/activities", activityDto);

            if (activity.getWorkspace() != null) {
                messagingTemplate.convertAndSend("/topic/workspace/" + activity.getWorkspace().getId() + "/activities", activityDto);
            }
        } catch (Exception e) {
            log.error("Failed to send real-time activity update for activityId {}", activity.getId(), e);
        }
    }

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

    public List<ActivityDto> getRecentActivities(int limit) {
        List<Activity> activities = activityRepository.findRecentActivities(limit);
        return activities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ActivityDto> getTaskActivities(Long taskId) {
        List<Activity> activities = activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return activities.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getActivityStats(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Long> stats = new HashMap<>();
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
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

    @Transactional
    public void clearUserActivities(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        activityRepository.deleteByUserId(userId);
    }

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