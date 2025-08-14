package com.taskifyApplication.model;

public enum RoleEnum {
    OWNER("Owner"),
    ADMIN("Admin"),
    MEMBER("Member"),
    VIEWER("Viewer");

    private final String displayName;

    RoleEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
