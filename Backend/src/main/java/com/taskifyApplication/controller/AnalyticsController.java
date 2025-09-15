package com.taskifyApplication.controller;

import com.taskifyApplication.dto.analytics.*;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.WorkspaceRepository;
import com.taskifyApplication.service.AnalyticsService;
import com.taskifyApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findByEmail(email).orElse(null);
    }
    
    private boolean hasWorkspaceAccess(User user, Long workspaceId) {
        if (workspaceId == null) return true; // Se não especificar workspace, permite
        
        return workspaceRepository.accessibleForUser(user, workspaceId);
    }

    @GetMapping("/productivity")
    public ResponseEntity<ProductivityMetricsDto> getProductivityMetrics(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        Long effectiveUserId = userId != null ? userId : currentUser.getId();

        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            return ResponseEntity.status(403).build();
        }
      if (!effectiveUserId.equals(currentUser.getId())) {
            effectiveUserId = currentUser.getId();
        }
        
        ProductivityMetricsDto metrics = analyticsService.getProductivityMetrics(
                workspaceId, effectiveUserId, startDate, endDate, period);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDto> getAnalyticsOverview(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }
        
       if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            return ResponseEntity.status(403).build();
        }
        
        AnalyticsOverviewDto overview = analyticsService.getAnalyticsOverview(
                workspaceId, currentUser.getId(), startDate, endDate, period);
        return ResponseEntity.ok(overview);
    }


    @GetMapping("/distribution")
    public ResponseEntity<DistributionDataDto> getDistributionData(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }
        
        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            return ResponseEntity.status(403).build();
        }
        
        DistributionDataDto distribution = analyticsService.getDistributionData(
                workspaceId, currentUser.getId(), startDate, endDate, period);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/team")
    public ResponseEntity<TeamAnalyticsDto> getTeamAnalytics(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }
        
        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            return ResponseEntity.status(403).build();
        }
        
        TeamAnalyticsDto teamAnalytics = analyticsService.getTeamAnalytics(
                workspaceId, currentUser.getId(), startDate, endDate, period);
        return ResponseEntity.ok(teamAnalytics);
    }
}