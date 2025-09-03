package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "time_tracking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
public class TimeTracking {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    private Integer duration; // in minutes

    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = false;

    @PrePersist
    protected void onCreate() {
        if (this.startTime == null) {
            this.startTime = OffsetDateTime.now();
        }
    }

    public void stop() {
        if (this.endTime == null) {
            this.endTime = OffsetDateTime.now();
            this.isActive = false;
            
            // Calculate duration in minutes
            long diffInMillis = this.endTime.toInstant().toEpochMilli() - 
                               this.startTime.toInstant().toEpochMilli();
            this.duration = (int) (diffInMillis / (1000 * 60));
        }
    }
}