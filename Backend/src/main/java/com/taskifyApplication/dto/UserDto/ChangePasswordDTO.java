package com.taskifyApplication.dto.UserDto;


import lombok.Data;

@Data
public class ChangePasswordDTO {

    private String password;
    private String newPassword;
}
