package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "task_dependencies", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "depends_on_task_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
public class TaskDependency {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_task_id", nullable = false)
    private Task dependsOnTask;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DependencyType type = DependencyType.FINISH_TO_START;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public enum DependencyType {
        FINISH_TO_START,
        START_TO_START,
        FINISH_TO_FINISH,
        START_TO_FINISH
    }
}