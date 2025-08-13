package com.taskifyApplication.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

public class TaskComment {
    @Id
    @GeneratedValue
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    private User author;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
