package com.taskifyApplication.dto.TimeTrackingDto;

import lombok.Data;
import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class TimeReportDTO {
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private Long totalMinutes;
    private String totalTimeFormatted; // e.g., "2h 30m"
    private Integer totalDays;
    private Double averageHoursPerDay;
    private List<TimeTrackingResponseDTO> entries;
    private List<TaskTimeReportDTO> taskBreakdown;
}