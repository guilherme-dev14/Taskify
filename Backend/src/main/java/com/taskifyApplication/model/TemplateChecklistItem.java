package com.taskifyApplication.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_checklist_items")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter @Setter
public class TemplateChecklistItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TaskTemplate template;

    @Column(nullable = false)
    private String text;

    @Builder.Default
    private Integer orderIndex = 0;

    private Long assigneeId; // Optional default assignee
}