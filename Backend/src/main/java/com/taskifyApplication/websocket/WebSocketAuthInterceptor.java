package com.taskifyApplication.websocket;

import com.taskifyApplication.service.JwtService;
import com.taskifyApplication.service.UserService;
import com.taskifyApplication.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {

        String authorizationHeader = request.getHeaders().getFirst("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            try {
                String username = jwtService.extractUsername(token);

                if (username != null && jwtService.isTokenValid(token, getUserDetails(username))) {
                    Optional<User> userOptional = userService.findByUsername(username);

                    if (userOptional.isPresent()) {
                        User user = userOptional.get();

                        // Create authenticated principal
                        UserDetails userDetails = getUserDetails(username);
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                        );

                        // Store user information in WebSocket session attributes
                        attributes.put("user", user);
                        attributes.put("authentication", authentication);
                        attributes.put("principal", userDetails);

                        return true;
                    }
                }
            } catch (Exception e) {
                System.err.println("WebSocket authentication failed: " + e.getMessage());
                return false;
            }
        }

        // Reject connection if no valid token
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                              ServerHttpResponse response,
                              WebSocketHandler wsHandler,
                              Exception exception) {
        // Nothing to do after handshake
    }

    private UserDetails getUserDetails(String username) {
        return userService.findByUsername(username)
            .map(user -> org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build())
            .orElse(null);
    }
}