package com.taskifyApplication.dto.PasswordDto;

public record ResetPasswordRequest(String token, String newPassword) {}
