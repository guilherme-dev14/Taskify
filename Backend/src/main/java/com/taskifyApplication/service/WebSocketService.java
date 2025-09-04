package com.taskifyApplication.service;

import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    public void notifyWorkspaceTaskUpdate(Long workspaceId, TaskSummaryDTO task, String action, User actionBy) {
        Map<String, Object> message = new HashMap<>();
        message.put("action", action); // "CREATED", "UPDATED", "DELETED", "ASSIGNED"
        message.put("task", task);
        message.put("actionBy", actionBy.getFirstName() + " " + actionBy.getLastName());
        message.put("timestamp", System.currentTimeMillis());

        // Send to all users in the workspace
        simpMessagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/tasks", message);
    }

    public void notifyTaskAssignment(Task task, User assignedTo, User assignedBy) {
        Map<String, Object> message = new HashMap<>();
        message.put("action", "TASK_ASSIGNED");
        message.put("taskId", task.getId());
        message.put("taskTitle", task.getTitle());
        message.put("assignedBy", assignedBy.getFirstName() + " " + assignedBy.getLastName());
        message.put("timestamp", System.currentTimeMillis());

        // Send directly to the assigned user
        simpMessagingTemplate.convertAndSendToUser(
            assignedTo.getEmail(), 
            "/queue/notifications", 
            message
        );
    }

    public void notifyWorkspaceActivity(Long workspaceId, String activity, User user) {
        Map<String, Object> message = new HashMap<>();
        message.put("activity", activity);
        message.put("user", user.getFirstName() + " " + user.getLastName());
        message.put("userId", user.getId());
        message.put("timestamp", System.currentTimeMillis());

        // Send to all users in the workspace
        simpMessagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/activity", message);
    }
}