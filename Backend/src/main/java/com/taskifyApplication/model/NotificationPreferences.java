package com.taskifyApplication.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
public class NotificationPreferences {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @NotNull
    private Boolean emailNotifications = true;

    @Builder.Default
    private Boolean pushNotifications = true;

    @Builder.Default
    private Boolean taskAssignments = true;

    @Builder.Default
    private Boolean taskUpdates = true;

    @Builder.Default
    private Boolean dueDates = true;

    @Builder.Default
    private Boolean workspaceUpdates = true;

    @Builder.Default
    private Boolean comments = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DigestFrequency digestEmail = DigestFrequency.DAILY;

    public enum DigestFrequency {
        NONE,
        DAILY,
        WEEKLY
    }
}