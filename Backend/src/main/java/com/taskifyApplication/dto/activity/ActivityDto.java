package com.taskifyApplication.dto.activity;

import java.time.LocalDateTime;

public class ActivityDto {
    private Long id;
    private String type;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private UserDto user;
    private String metadata;

    // Constructors
    public ActivityDto() {}

    public ActivityDto(Long id, String type, String title, String description, 
                      LocalDateTime timestamp, UserDto user, String metadata) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.user = user;
        this.metadata = metadata;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    // Inner class for User information
    public static class UserDto {
        private Long id;
        private String name;
        private String avatar;

        public UserDto() {}

        public UserDto(Long id, String name, String avatar) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
    }
}