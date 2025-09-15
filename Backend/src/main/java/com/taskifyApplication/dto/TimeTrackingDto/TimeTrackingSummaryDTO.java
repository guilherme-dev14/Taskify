package com.taskifyApplication.dto.TimeTrackingDto;

import lombok.Data;

@Data
public class TimeTrackingSummaryDTO {
    private Integer totalMinutes;
    private String formattedTotalTime;
    private Integer sessionsCount;
    private Integer activeSessionsCount;
    
    public TimeTrackingSummaryDTO(Integer totalMinutes, Integer sessionsCount, Integer activeSessionsCount) {
        this.totalMinutes = totalMinutes != null ? totalMinutes : 0;
        this.sessionsCount = sessionsCount;
        this.activeSessionsCount = activeSessionsCount;
        this.formattedTotalTime = formatDuration(this.totalMinutes);
    }
    
    private String formatDuration(int totalMinutes) {
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }
}