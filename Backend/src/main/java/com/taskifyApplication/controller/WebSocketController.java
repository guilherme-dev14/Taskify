package com.taskifyApplication.controller;

import com.taskifyApplication.service.JwtService;
import com.taskifyApplication.service.UserService;
import com.taskifyApplication.model.User;
import com.taskifyApplication.websocket.WebSocketSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @Autowired
    private UserService userService;

    @Autowired
    private WebSocketSessionManager sessionManager;

    @MessageMapping("/workspace.join")
    public void joinWorkspace(@Payload Map<String, Object> payload, Principal principal) {
        String workspaceId = (String) payload.get("workspaceId");
        User user = getCurrentUser(principal);

        if (user != null && workspaceId != null) {
            sessionManager.addUserToWorkspace(user.getId(), Long.parseLong(workspaceId));

            // Notify other workspace members that user is online
            messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/presence",
                    Map.of("type", "USER_ONLINE", "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "firstName", user.getFirstName(),
                            "lastName", user.getLastName()
                    ))
            );
        }
    }

    @MessageMapping("/workspace.leave")
    public void leaveWorkspace(@Payload Map<String, Object> payload, Principal principal) {
        String workspaceId = (String) payload.get("workspaceId");
        User user = getCurrentUser(principal);

        if (user != null && workspaceId != null) {
            sessionManager.removeUserFromWorkspace(user.getId(), Long.parseLong(workspaceId));

            // Notify other workspace members that user is offline
            messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/presence",
                    Map.of("type", "USER_OFFLINE", "userId", user.getId())
            );
        }
    }

    @MessageMapping("/task.watch")
    public void watchTask(@Payload Map<String, Object> payload, Principal principal) {
        String taskId = (String) payload.get("taskId");
        User user = getCurrentUser(principal);

        if (user != null && taskId != null) {
            sessionManager.addUserToTask(user.getId(), Long.parseLong(taskId));
        }
    }


    @MessageMapping("/task.unwatch")
    public void unwatchTask(@Payload Map<String, Object> payload, Principal principal) {
        String taskId = (String) payload.get("taskId");
        User user = getCurrentUser(principal);

        if (user != null && taskId != null) {
            sessionManager.removeUserFromTask(user.getId(), Long.parseLong(taskId));
        }
    }

    @MessageMapping("/cursor.update")
    public void updateCursor(@Payload Map<String, Object> payload, Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null) return;

        Number x = (Number) payload.get("x");
        Number y = (Number) payload.get("y");
        String taskId = (String) payload.get("taskId");

        Map<String, Object> cursorData = Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "x", x != null ? x.doubleValue() : 0,
                "y", y != null ? y.doubleValue() : 0
        );

        // Broadcast cursor position to workspace or task
        if (taskId != null) {
            messagingTemplate.convertAndSend("/topic/task/" + taskId + "/cursors", cursorData);
        } else {
            // Get user's current workspaces and broadcast to all
            sessionManager.getUserWorkspaces(user.getId()).forEach(workspaceId ->
                    messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/cursors", cursorData)
            );
        }
    }

    /**
     * Handle typing indicators
     */
    @MessageMapping("/typing.start")
    public void startTyping(@Payload Map<String, Object> payload, Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null) return;

        String taskId = (String) payload.get("taskId");

        Map<String, Object> typingData = Map.of(
                "type", "START",
                "userId", user.getId(),
                "username", user.getUsername(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName()
        );

        if (taskId != null) {
            messagingTemplate.convertAndSend("/topic/task/" + taskId + "/typing", typingData);
        }
    }

    @MessageMapping("/typing.stop")
    public void stopTyping(@Payload Map<String, Object> payload, Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null) return;

        String taskId = (String) payload.get("taskId");

        Map<String, Object> typingData = Map.of(
                "type", "STOP",
                "userId", user.getId()
        );

        if (taskId != null) {
            messagingTemplate.convertAndSend("/topic/task/" + taskId + "/typing", typingData);
        }
    }

    /**
     * Subscribe to workspace presence updates
     */
    @SubscribeMapping("/workspace/{workspaceId}/presence")
    public void subscribeToWorkspacePresence() {
        // Implementation handled by client subscription
    }

    /**
     * Subscribe to task updates
     */
    @SubscribeMapping("/task/{taskId}/updates")
    public void subscribeToTaskUpdates() {
        // Implementation handled by client subscription
    }

    /**
     * Subscribe to activities
     */
    @SubscribeMapping("/activities")
    public void subscribeToActivities() {
        // Implementation handled by client subscription
    }

    /**
     * Subscribe to workspace activities
     */
    @SubscribeMapping("/workspace/{workspaceId}/activities")
    public void subscribeToWorkspaceActivities() {
        // Implementation handled by client subscription
    }

    private User getCurrentUser(Principal principal) {
        if (principal == null) return null;

        try {
            // Extract user from JWT token
            String username = principal.getName();
            return userService.findByUsername(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }


}