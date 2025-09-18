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


    @GetMapping("/productivity")
    public ResponseEntity<ProductivityMetricsDto> getProductivityMetrics(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        ProductivityMetricsDto metrics = analyticsService.getProductivityMetrics(
                workspaceId, userId, startDate, endDate);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDto> getAnalyticsOverview(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "month") String period) {

        AnalyticsOverviewDto overview = analyticsService.getAnalyticsOverview(
                workspaceId, startDate, endDate);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/distribution")
    public ResponseEntity<DistributionDataDto> getDistributionData(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        DistributionDataDto distribution = analyticsService.getDistributionData(
                workspaceId, startDate, endDate);
        return ResponseEntity.ok(distribution);
    }
}