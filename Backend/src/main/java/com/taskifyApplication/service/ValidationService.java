// taskifyApplication/service/ValidationService.java

package com.taskifyApplication.service;

import org.springframework.stereotype.Service;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

import java.util.regex.Pattern;

@Service
public class ValidationService {

    private final PolicyFactory policy = Sanitizers.FORMATTING
            .and(Sanitizers.LINKS)
            .and(Sanitizers.BLOCKS);

    public String sanitizeHtml(String input) {
        if (input == null) return null;
        return policy.sanitize(input);
    }

    public String sanitizeString(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"'&]", "");
    }

    private static final Pattern SAFE_FILENAME = Pattern.compile("^[a-zA-Z0-9._\\-()\\[\\] ]+$");
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public boolean isValidFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return false;
        }
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return false;
        }
        return filename.length() <= 255 && SAFE_FILENAME.matcher(filename).matches();
    }

    public boolean isValidFileSize(long size) {
        return size > 0 && size <= MAX_FILE_SIZE;
    }

    public boolean isValidFileType(String contentType) {
        if (contentType == null) return false;

        String[] allowedTypes = {
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
                "application/pdf", "text/plain", "text/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        for (String allowedType : allowedTypes) {
            if (contentType.equalsIgnoreCase(allowedType)) {
                return true;
            }
        }
        return false;
    }

    public boolean isValidEmail(String email) {
        if (email == null) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$") &&
                email.length() <= 254;
    }

    public boolean isValidPassword(String password) {
        if (password == null) return false;
        return password.length() >= 8 &&
                password.matches(".*[A-Z].*") &&
                password.matches(".*[a-z].*") &&
                password.matches(".*\\d.*");
    }

    public boolean isValidUsername(String username) {
        if (username == null) return false;
        return username.matches("^[a-zA-Z0-9_-]{3,20}$");
    }

    public boolean isValidTaskTitle(String title) {
        if (title == null) return false;
        return title.trim().length() >= 1 && title.length() <= 200;
    }

    public boolean isValidTaskDescription(String description) {
        if (description == null) return true; // Optional field
        return description.length() <= 5000;
    }
}