package com.taskifyApplication.dto.UserDto;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String bio;
    private String location;
    private String website;
    private String avatar;
    private OffsetDateTime createdAt;
}