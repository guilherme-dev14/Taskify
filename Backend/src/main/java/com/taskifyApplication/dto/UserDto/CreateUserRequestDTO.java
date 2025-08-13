package com.taskifyApplication.dto.UserDto;


import jakarta.persistence.Column;

public class CreateUserRequestDTO {
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    @Column(nullable = false, length = 50)
    private String password;
    @Column(nullable = false, length = 50, unique = true)
    private String email;

}
