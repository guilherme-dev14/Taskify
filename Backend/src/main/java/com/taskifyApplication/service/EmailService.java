package com.taskifyApplication.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private final TemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String mailFrom;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;

    @Async("emailExecutor")
    protected CompletableFuture<Boolean> sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        return sendHtmlEmailWithRetry(to, subject, templateName, variables, 3);
    }

    private CompletableFuture<Boolean> sendHtmlEmailWithRetry(String to, String subject, String templateName, Map<String, Object> variables, int maxRetries) {
        return CompletableFuture.supplyAsync(() -> {
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

                    Context context = new Context();
                    context.setVariables(variables);

                    String htmlContent = templateEngine.process(templateName, context);

                    helper.setTo(to);
                    helper.setFrom(mailFrom);
                    helper.setSubject(subject);
                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);

                    System.out.println("Email sent successfully to " + to + " on attempt " + attempt);
                    return true; // Success

                } catch (MessagingException e) {
                    System.err.println("Email send attempt " + attempt + "/" + maxRetries + " failed for " + to + ": " + e.getMessage());

                    if (attempt == maxRetries) {
                        System.err.println("All email send attempts failed for " + to + ". Final error: " + e.getMessage());
                        return false; // All attempts failed
                    }

                    // Wait before retry (exponential backoff)
                    try {
                        Thread.sleep(1000L * attempt); // 1s, 2s, 3s delays
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return false;
                    }
                } catch (Exception e) {
                    System.err.println("Unexpected error sending email to " + to + " on attempt " + attempt + ": " + e.getMessage());
                    if (attempt == maxRetries) {
                        return false;
                    }
                }
            }
            return false;
        });
    }

    public void sendWelcomeEmail(String to, String name) {
        System.out.println("=== SENDING WELCOME EMAIL ===");
        System.out.println("To: " + to);
        System.out.println("Name: " + name);
        System.out.println("From: " + mailFrom);
        sendHtmlEmail(to,
                "Bem-vindo ao Taskify!",
                "welcome-email",
                Map.of("name", name)
        ).thenAccept(success -> {
            if (success) {
                System.out.println("✓ Welcome email sent successfully to " + to);
            } else {
                System.err.println("✗ Failed to send welcome email to " + to);
            }
        });
    }

    public void sendPasswordResetEmail(String to, String name, String token) {
        System.out.println("=== SENDING PASSWORD RESET EMAIL ===");
        System.out.println("To: " + to);
        System.out.println("Name: " + name);
        System.out.println("Token: " + token);
        System.out.println("Frontend URL: " + frontendBaseUrl);
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;
        System.out.println("Reset Link: " + resetLink);
        sendHtmlEmail(to,
                "Taskify - Redefinição de Senha",
                "password-reset-email",
                Map.of("name", name, "resetLink", resetLink)
        ).thenAccept(success -> {
            if (success) {
                System.out.println("✓ Password reset email sent successfully to " + to);
            } else {
                System.err.println("✗ Failed to send password reset email to " + to);
            }
        });
    }

    public void sendWorkspaceInviteEmail(String to, String inviterName, String workspaceName, String inviteLink) {
        sendHtmlEmail(to,
                "Você foi convidado para um workspace no Taskify!",
                "workspace-invite-email",
                Map.of("inviterName", inviterName, "workspaceName", workspaceName, "inviteLink", inviteLink)
        );
    }

    public void sendTaskAssignedEmail(String to, String assigneeName, String assignerName, String workspaceName, String taskTitle, String taskDueDate, String taskLink) {
        sendHtmlEmail(to,
                "Nova tarefa atribuída a você: " + taskTitle,
                "task-assigned-email",
                Map.of(
                        "assigneeName", assigneeName,
                        "assignerName", assignerName,
                        "workspaceName", workspaceName,
                        "taskTitle", taskTitle,
                        "taskDueDate", taskDueDate,
                        "taskLink", taskLink
                )
        );
    }
}