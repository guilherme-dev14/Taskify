package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "time_tracking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class TimeTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "duration") // in minutes
    private Integer duration;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
        
        // Calculate duration if end time is set
        if (endTime != null && startTime != null) {
            long minutes = java.time.Duration.between(startTime, endTime).toMinutes();
            duration = (int) minutes;
        }
    }

    // Helper method to calculate current duration for active sessions
    public Integer getCurrentDuration() {
        if (startTime == null) return 0;
        
        OffsetDateTime endTimeToUse = endTime != null ? endTime : OffsetDateTime.now();
        return (int) java.time.Duration.between(startTime, endTimeToUse).toMinutes();
    }

    // Helper method to format duration
    public String getFormattedDuration() {
        int totalMinutes = duration != null ? duration : getCurrentDuration();
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }
}