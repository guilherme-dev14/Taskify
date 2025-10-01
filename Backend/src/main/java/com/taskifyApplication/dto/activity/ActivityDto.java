package com.taskifyApplication.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    // Getters and Setters
    private Long id;
    private String type;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private UserDto user;
    private String metadata;

    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String avatar;
    }
}