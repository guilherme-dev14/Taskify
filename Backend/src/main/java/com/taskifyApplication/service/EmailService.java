package com.taskifyApplication.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Async
    protected void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Erro ao enviar email para " + to + ": " + e.getMessage());
        }
    }

    // --- MÉTODOS PÚBLICOS PARA CADA TIPO DE EMAIL ---

    public void sendWelcomeEmail(String to, String name) {
        sendHtmlEmail(to,
                "Bem-vindo ao Taskify!",
                "welcome-email",
                Map.of("name", name)
        );
    }

    public void sendPasswordResetEmail(String to, String name, String token) {
        String resetLink = "http://localhost:5173/reset-password?token=" + token; // URL do seu frontend
        sendHtmlEmail(to,
                "Taskify - Redefinição de Senha",
                "password-reset-email",
                Map.of("name", name, "resetLink", resetLink)
        );
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