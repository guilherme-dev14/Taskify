package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TimeTrackingDto.*;
import com.taskifyApplication.service.TimeTrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks/time-tracking")
public class TimeTrackingController {

    @Autowired
    private TimeTrackingService timeTrackingService;

    @PostMapping("/start")
    public ResponseEntity<TimeTrackingResponseDTO> startTimeTracking(@Valid @RequestBody TimeTrackingRequestDTO request) {
        TimeTrackingResponseDTO response = timeTrackingService.startTracking(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{timeTrackingId}/stop")
    public ResponseEntity<TimeTrackingResponseDTO> stopTimeTracking(@PathVariable Long timeTrackingId) {
        TimeTrackingResponseDTO response = timeTrackingService.stopTracking(timeTrackingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeTrackingResponseDTO>> getTaskTimeTrackingEntries(@PathVariable Long taskId) {
        List<TimeTrackingResponseDTO> entries = timeTrackingService.getTimeTrackingEntries(taskId);
        return ResponseEntity.ok(entries);
    }

    @PatchMapping("/{timeTrackingId}")
    public ResponseEntity<TimeTrackingResponseDTO> updateTimeTracking(
            @PathVariable Long timeTrackingId,
            @Valid @RequestBody TimeTrackingUpdateDTO updateDTO) {
        TimeTrackingResponseDTO response = timeTrackingService.updateTimeTracking(timeTrackingId, updateDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{timeTrackingId}")
    public ResponseEntity<Void> deleteTimeTracking(@PathVariable Long timeTrackingId) {
        timeTrackingService.deleteTimeTracking(timeTrackingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/{taskId}/total-time")
    public ResponseEntity<TimeTrackingSummaryDTO> getTotalTimeSpent(@PathVariable Long taskId) {
        TimeTrackingSummaryDTO summary = timeTrackingService.getTotalTimeSpent(taskId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/active")
    public ResponseEntity<List<TimeTrackingResponseDTO>> getActiveSessionsForUser() {
        List<TimeTrackingResponseDTO> activeSessions = timeTrackingService.getActiveSessionsForUser();
        return ResponseEntity.ok(activeSessions);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TimeTrackingResponseDTO>> getUserTimeTrackingHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        List<TimeTrackingResponseDTO> history = timeTrackingService.getUserTimeTrackingHistory(startDate, endDate);
        return ResponseEntity.ok(history);
    }
}