package com.taskifyApplication.dto.UserDto;


import lombok.Data;

@Data
public class UserSummaryDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePictureUrl;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
