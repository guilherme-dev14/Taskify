package com.taskifyApplication.model;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "Tasks")
@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@Builder
public class Task {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private StatusTaskEnum status = StatusTaskEnum.NEW;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private PriorityEnum priority = PriorityEnum.LOW;

    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private Integer estimatedHours;
    private Integer actualHours;
    private Double completionPercentage;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TaskComment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "task_categories",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private List<Category> categories = new ArrayList<>();

    public boolean canEdit(User user) {
        return workspace.getUserRole(user) != null &&
                (assignedTo == null || assignedTo.equals(user) ||
                        workspace.getUserRole(user) == RoleEnum.ADMIN ||
                        workspace.getUserRole(user) == RoleEnum.OWNER);
    }

    @PrePersist
    protected void onCreate(){
        this.createdAt = OffsetDateTime.now();
        if (this.status == null) {
            this.status = StatusTaskEnum.NEW;
        }
        if (this.priority == null) {
            this.priority = PriorityEnum.LOW;
        }
    }
}