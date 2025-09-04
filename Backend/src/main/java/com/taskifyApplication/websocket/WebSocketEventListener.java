package com.taskifyApplication.websocket;

import com.taskifyApplication.service.JwtService;
import com.taskifyApplication.service.UserService;
import com.taskifyApplication.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
public class WebSocketEventListener {

    @Autowired
    private WebSocketSessionManager sessionManager;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        User user = extractUserFromHeaders(headerAccessor);
        
        if (user != null) {
            headerAccessor.getSessionAttributes().put("userId", user.getId());
            System.out.println("User connected: " + user.getUsername());
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        if (userId != null) {
            // Get user's workspaces before removing
            var userWorkspaces = sessionManager.getUserWorkspaces(userId);
            
            // Remove user from all sessions
            sessionManager.removeUser(userId);
            
            // Notify workspaces that user went offline
            for (Long workspaceId : userWorkspaces) {
                messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/presence", 
                    Map.of("type", "USER_OFFLINE", "userId", userId)
                );
            }
            
            System.out.println("User disconnected: " + userId);
        }
    }

    private User extractUserFromHeaders(StompHeaderAccessor headerAccessor) {
        try {
            // Try to get Authorization header
            String authHeader = headerAccessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            
            if (username != null) {
                User user = userService.findByUsername(username).orElse(null);
                if (user != null) {
                    // Create a simple UserDetails implementation for token validation
                    org.springframework.security.core.userdetails.UserDetails userDetails = 
                        org.springframework.security.core.userdetails.User.builder()
                            .username(user.getUsername())
                            .password(user.getPassword())
                            .authorities("USER")
                            .build();
                    
                    if (jwtService.isTokenValid(token, userDetails)) {
                        return user;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting user from WebSocket headers: " + e.getMessage());
        }
        
        return null;
    }
}