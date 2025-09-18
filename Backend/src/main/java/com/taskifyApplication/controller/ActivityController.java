package com.taskifyApplication.controller;

import com.taskifyApplication.dto.activity.ActivityDto;
import com.taskifyApplication.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<Page<ActivityDto>> getActivities(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ActivityDto> activities = activityService.getActivities(
                workspaceId, userId, type, startDate, endDate, page, size);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityDto>> getRecentActivities(
            @RequestParam(defaultValue = "20") int limit) {
        
        List<ActivityDto> activities = activityService.getRecentActivities(limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ActivityDto>> getUserActivities(
            @PathVariable Long userId,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ActivityDto> activities = activityService.getActivities(
                workspaceId, userId, type, startDate, endDate, page, size);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<Page<ActivityDto>> getWorkspaceActivities(
            @PathVariable Long workspaceId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ActivityDto> activities = activityService.getActivities(
                workspaceId, null, type, startDate, endDate, page, size);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityDto>> getTaskActivities(@PathVariable Long taskId) {
        List<ActivityDto> activities = activityService.getTaskActivities(taskId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getActivityStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Long> stats = activityService.getActivityStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<Void> clearUserActivities(@PathVariable Long userId) {
        activityService.clearUserActivities(userId);
        return ResponseEntity.ok().build();
    }
}