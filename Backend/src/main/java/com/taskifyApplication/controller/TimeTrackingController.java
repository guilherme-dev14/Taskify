package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TimeTrackingDto.*;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/time-tracking")
@SecurityRequirement(name = "bearerAuth")
public class TimeTrackingController {

    @Autowired
    private TimeTrackingService timeTrackingService;

    @PostMapping("/start")
    public ResponseEntity<TimeTrackingResponseDTO> startTimeTracking(@Valid @RequestBody StartTimeTrackingDTO startDTO) {
        try {
            TimeTrackingResponseDTO response = timeTrackingService.startTimeTracking(startDTO);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<TimeTrackingResponseDTO> stopTimeTracking() {
        try {
            TimeTrackingResponseDTO response = timeTrackingService.stopTimeTracking();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<TimeTrackingResponseDTO> getActiveTimeTracking() {
        TimeTrackingResponseDTO activeTracking = timeTrackingService.getActiveTimeTracking();
        if (activeTracking != null) {
            return ResponseEntity.ok(activeTracking);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<PageResponse<TimeTrackingResponseDTO>> getUserTimeTrackingHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
            
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<TimeTrackingResponseDTO> history = timeTrackingService.getUserTimeTrackingHistory(pageable);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeTrackingResponseDTO>> getTaskTimeTrackingHistory(@PathVariable Long taskId) {
        try {
            List<TimeTrackingResponseDTO> history = timeTrackingService.getTaskTimeTrackingHistory(taskId);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/report")
    public ResponseEntity<TimeReportDTO> generateTimeReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        TimeReportDTO report = timeTrackingService.generateUserTimeReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/report/week")
    public ResponseEntity<TimeReportDTO> generateWeeklyReport() {
        OffsetDateTime endDate = OffsetDateTime.now();
        OffsetDateTime startDate = endDate.minusDays(7);
        
        TimeReportDTO report = timeTrackingService.generateUserTimeReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/report/month")
    public ResponseEntity<TimeReportDTO> generateMonthlyReport() {
        OffsetDateTime endDate = OffsetDateTime.now();
        OffsetDateTime startDate = endDate.minusMonths(1);
        
        TimeReportDTO report = timeTrackingService.generateUserTimeReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable Long entryId) {
        try {
            timeTrackingService.deleteTimeEntry(entryId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportTimeReportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        
        TimeReportDTO report = timeTrackingService.generateUserTimeReport(startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Task,Start Time,End Time,Duration,Description,Workspace\n");
        
        for (TimeTrackingResponseDTO entry : report.getEntries()) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s\n",
                entry.getTaskTitle(),
                entry.getStartTime(),
                entry.getEndTime() != null ? entry.getEndTime() : "Active",
                entry.getDuration() != null ? entry.getDuration() + " min" : "0 min",
                entry.getDescription() != null ? entry.getDescription() : "",
                entry.getWorkspaceName()));
        }
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=time_report.csv")
                .body(csv.toString());
    }
}