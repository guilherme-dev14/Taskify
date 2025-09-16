package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "userSettings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter @Setter
public class UserSettings {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String theme = "system";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String language = "en";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String timezone = "UTC-3";

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean pushNotifications = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean weeklyReports = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean taskReminders = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean teamUpdates = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoSave = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean compactView = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean showAvatars = true;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String defaultWorkspace = "personal";

    @Column(nullable = false)
    @Builder.Default
    private Boolean taskAutoAssign = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String workspacePrivacy = "private";
}