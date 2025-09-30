package com.taskifyApplication.service;


import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.model.PasswordResetToken;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.PasswordResetTokenRepository;
import com.taskifyApplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Transactional
@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokens;
    private final UserRepository users;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;

    @Value("${app.resetTokenTtlMinutes:30}")
    private int tokenTtlMinutes;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    public PasswordResetService(PasswordResetTokenRepository tokens, UserRepository users, JavaMailSender mailSender) {
        this.tokens = tokens; this.users = users; this.mailSender = mailSender;
    }

    public void startReset(String email) {
        var user = users.findByEmail(email).orElse(null);

        if (user == null) return;

        tokens.deleteAllByUser(user);

        String rawToken = generateToken();
        String tokenHash = sha256Hex(rawToken);

        var entity = new PasswordResetToken();
        entity.setUser(user);
        entity.setTokenHash(tokenHash);
        entity.setExpiresAt(Instant.now().plusSeconds(tokenTtlMinutes * 60L));
        tokens.save(entity);

        String link = frontendBaseUrl + "/reset-password?token=" + rawToken;
        sendEmail(user.getEmail(), link);
    }

    public void finishReset(String rawToken, String newPassword) {
        String tokenHash = sha256Hex(rawToken);
        var token = tokens.findByTokenHash(tokenHash).orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (token.getUsedAt() != null || Instant.now().isAfter(token.getExpiresAt())) {
            throw new ForbiddenException("Expired or used token");
        }

        var user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        users.save(user);

        token.setUsedAt(Instant.now());
        tokens.save(token);

        tokens.deleteAllByUser(user);
    }

    private void sendEmail(String to, String link) {
        var msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(to);
        msg.setSubject("Reset your password");
        msg.setText("""
      You (or someone else) requested a password reset.
      Click the link below to set a new password. This link expires in %d minutes.
      %s

      If you didn't request this, ignore this email.
      """.formatted(tokenTtlMinutes, link));
        mailSender.send(msg);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String s) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes());
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void createPasswordResetTokenForUser(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken();
        myToken.setUser(user);
        myToken.setTokenHash(passwordEncoder.encode(token));
        myToken.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        passwordResetTokenRepository.save(myToken);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
    }
}