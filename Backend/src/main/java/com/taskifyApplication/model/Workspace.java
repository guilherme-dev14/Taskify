package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workspaces")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter @Setter
public class Workspace {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    private String description;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkspaceMember> members = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "invite_code", length = 50, unique = true)
    private String inviteCode;

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @OrderBy("order ASC")
    private List<TaskStatus> taskStatuses = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = OffsetDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void addDefaultStatuses() {
        if (this.taskStatuses == null) {
            this.taskStatuses = new ArrayList<>();
        }
        if (this.taskStatuses.isEmpty()) {
            this.taskStatuses.add(TaskStatus.builder().workspace(this).name("To Do").color("#3B82F6").order(0).build());
            this.taskStatuses.add(TaskStatus.builder().workspace(this).name("In Progress").color("#F59E0B").order(1).build());
            this.taskStatuses.add(TaskStatus.builder().workspace(this).name("Completed").color("#10B981").order(2).build());
            this.taskStatuses.add(TaskStatus.builder().workspace(this).name("Cancelled").color("#EF4444").order(3).build());
        }
    }

    public boolean isMember(User user) {
        if (this.owner != null && this.owner.getId().equals(user.getId())) {
            return true;
        }
        return members.stream()
                .anyMatch(member -> member.getUser() != null && member.getUser().getId().equals(user.getId()));
    }

    public RoleEnum getUserRole(User user) {
        if (user == null || members == null) {
            return null;
        }
        if (owner != null && owner.equals(user)) {
            return RoleEnum.OWNER;
        }
        return members.stream()
                .filter(member -> member.getUser() != null && member.getUser().equals(user))
                .map(WorkspaceMember::getRole)
                .findFirst()
                .orElse(null);
    }
}