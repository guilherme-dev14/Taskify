package com.taskifyApplication.model;

import jakarta.persistence.Entity;
import lombok.Getter;



public enum PriorityEnum {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent");

    private final String displayName;

    PriorityEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}