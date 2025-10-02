package com.taskifyApplication.service;

import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationOrchestratorService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontendBaseUrl}")
    private String frontendBaseUrl;
    @Autowired
    private WebSocketService webSocketService;

    @Async("notificationExecutor")
    public void notifyUserOfTaskAssignment(User assigner, User assignee, Task task) {
        try {
            String message = assigner.getFirstName() + " atribuiu a tarefa '" + task.getTitle() + "' a você.";

            // Save notification to database
            Notification notification = new Notification();
            notification.setUser(assignee);
            notification.setMessage(message);
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send real-time notification via WebSocket
            webSocketService.notifyTaskAssignment(task, assignee, assigner);

            // Send email notification asynchronously
            sendTaskAssignmentEmail(assignee, assigner, task);

        } catch (Exception e) {
            System.err.println("Error processing task assignment notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async("emailExecutor")
    private void sendTaskAssignmentEmail(User assignee, User assigner, Task task) {
        try {
            String dueDate = (task.getDueDate() != null) ? task.getDueDate().toString() : "N/A";
            String taskLink = frontendBaseUrl + "/workspaces/" + task.getWorkspace().getId() + "/tasks/" + task.getId();

            emailService.sendTaskAssignedEmail(
                    assignee.getEmail(),
                    assignee.getFirstName(),
                    assigner.getFirstName(),
                    task.getWorkspace().getName(),
                    task.getTitle(),
                    dueDate,
                    taskLink
            );
        } catch (Exception e) {
            System.err.println("Error sending task assignment email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async("notificationExecutor")
    public void notifyUserOfWorkspaceInvite(User inviter, User invitedUser, Workspace workspace) {
        try {
            String message = inviter.getFirstName() + " convidou você para o workspace '" + workspace.getName() + "'.";

            // Save notification to database
            Notification notification = new Notification();
            notification.setUser(invitedUser);
            notification.setMessage(message);
            notification.setRead(false);
            notificationRepository.save(notification);

            // Send real-time notification via WebSocket
            webSocketService.notifyWorkspaceInvite(workspace, invitedUser, inviter);

            // Send email notification asynchronously
            sendWorkspaceInviteEmail(invitedUser, inviter, workspace);

        } catch (Exception e) {
            System.err.println("Error processing workspace invite notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async("emailExecutor")
    private void sendWorkspaceInviteEmail(User invitedUser, User inviter, Workspace workspace) {
        try {
            // Use workspace invite code for direct join
            String inviteLink = frontendBaseUrl + "/workspaces/join?code=" + workspace.getInviteCode();

            emailService.sendWorkspaceInviteEmail(
                    invitedUser.getEmail(),
                    inviter.getFirstName(),
                    workspace.getName(),
                    inviteLink
            );
        } catch (Exception e) {
            System.err.println("Error sending workspace invite email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async("notificationExecutor")
    public void notifyMembersOfNewJoinee(Workspace workspace, User newMember) {
        try {
            String message = newMember.getFirstName() + " " + newMember.getLastName() + " entrou no workspace.";

            // Notify workspace owner if they're not the new member
            if (!workspace.getOwner().equals(newMember)) {
                createAndSaveNotification(workspace.getOwner(), message);
            }

            // Notify all existing members
            workspace.getMembers().forEach(member -> {
                if (!member.getUser().equals(newMember)) {
                    createAndSaveNotification(member.getUser(), message);
                }
            });

            // Send real-time notification via WebSocket
            webSocketService.notifyWorkspaceActivity(workspace.getId(), message, newMember);

        } catch (Exception e) {
            System.err.println("Error processing new joinee notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createAndSaveNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }
}