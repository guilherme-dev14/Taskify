package com.taskifyApplication.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ValidationServiceTest {

    private ValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new ValidationService();
    }

    @Test
    void testSanitizeHtml() {
        String maliciousInput = "<script>alert('xss')</script><p>Safe content</p>";
        String result = validationService.sanitizeHtml(maliciousInput);
        
        assertFalse(result.contains("<script>"));
        assertTrue(result.contains("<p>Safe content</p>"));
    }

    @Test
    void testSanitizeString() {
        String maliciousInput = "<script>alert('xss')</script>";
        String result = validationService.sanitizeString(maliciousInput);
        
        assertEquals("scriptalert(xss)/script", result);
    }

    @Test
    void testIsValidEmail() {
        assertTrue(validationService.isValidEmail("test@example.com"));
        assertTrue(validationService.isValidEmail("user.name+tag@example.co.uk"));
        
        assertFalse(validationService.isValidEmail("invalid-email"));
        assertFalse(validationService.isValidEmail("@example.com"));
        assertFalse(validationService.isValidEmail("test@"));
        assertFalse(validationService.isValidEmail(null));
    }

    @Test
    void testIsValidPassword() {
        assertTrue(validationService.isValidPassword("StrongPass123"));
        assertTrue(validationService.isValidPassword("MySecure1"));
        
        assertFalse(validationService.isValidPassword("weak"));
        assertFalse(validationService.isValidPassword("weakpassword"));
        assertFalse(validationService.isValidPassword("WEAKPASSWORD"));
        assertFalse(validationService.isValidPassword("WeakPassword"));
        assertFalse(validationService.isValidPassword(null));
    }

    @Test
    void testIsValidUsername() {
        assertTrue(validationService.isValidUsername("user123"));
        assertTrue(validationService.isValidUsername("test_user"));
        assertTrue(validationService.isValidUsername("user-name"));
        
        assertFalse(validationService.isValidUsername("ab"));
        assertFalse(validationService.isValidUsername("a".repeat(25)));
        assertFalse(validationService.isValidUsername("user@name"));
        assertFalse(validationService.isValidUsername(null));
    }

    @Test
    void testIsValidFilename() {
        assertTrue(validationService.isValidFilename("document.pdf"));
        assertTrue(validationService.isValidFilename("image_01.jpg"));
        assertTrue(validationService.isValidFilename("test-file.txt"));
        
        assertFalse(validationService.isValidFilename(".htaccess"));
        assertFalse(validationService.isValidFilename("file../../../etc/passwd"));
        assertFalse(validationService.isValidFilename("file with spaces"));
        assertFalse(validationService.isValidFilename(null));
    }

    @Test
    void testIsValidFileSize() {
        assertTrue(validationService.isValidFileSize(1024)); // 1KB
        assertTrue(validationService.isValidFileSize(10 * 1024 * 1024)); // 10MB
        
        assertFalse(validationService.isValidFileSize(0));
        assertFalse(validationService.isValidFileSize(-1));
        assertFalse(validationService.isValidFileSize(100 * 1024 * 1024)); // 100MB
    }

    @Test
    void testIsValidFileType() {
        assertTrue(validationService.isValidFileType("image/jpeg"));
        assertTrue(validationService.isValidFileType("application/pdf"));
        assertTrue(validationService.isValidFileType("text/plain"));
        
        assertFalse(validationService.isValidFileType("application/x-executable"));
        assertFalse(validationService.isValidFileType("text/html"));
        assertFalse(validationService.isValidFileType(null));
    }

    @Test
    void testIsValidTaskTitle() {
        assertTrue(validationService.isValidTaskTitle("Valid Task Title"));
        assertTrue(validationService.isValidTaskTitle("A"));
        assertTrue(validationService.isValidTaskTitle("A".repeat(200)));
        
        assertFalse(validationService.isValidTaskTitle(""));
        assertFalse(validationService.isValidTaskTitle("   "));
        assertFalse(validationService.isValidTaskTitle("A".repeat(201)));
        assertFalse(validationService.isValidTaskTitle(null));
    }

    @Test
    void testIsValidTaskDescription() {
        assertTrue(validationService.isValidTaskDescription("Valid description"));
        assertTrue(validationService.isValidTaskDescription("A".repeat(5000)));
        assertTrue(validationService.isValidTaskDescription(null)); // Optional field
        assertTrue(validationService.isValidTaskDescription(""));
        
        assertFalse(validationService.isValidTaskDescription("A".repeat(5001)));
    }
}