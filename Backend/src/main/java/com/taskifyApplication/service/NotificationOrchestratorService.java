package com.taskifyApplication.service;

import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationOrchestratorService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;


    @Autowired
    private WebSocketService webSocketService;

    public void notifyUserOfTaskAssignment(User assigner, User assignee, Task task) {
        String message = assigner.getFirstName() + " atribuiu a tarefa '" + task.getTitle() + "' a você.";

        Notification notification = new Notification();
        notification.setUser(assignee);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);

        String dueDate = (task.getDueDate() != null) ? task.getDueDate().toString() : "N/A";
        String taskLink = "http://localhost:5173/workspaces/" + task.getWorkspace().getId() + "/tasks/" + task.getId();

        emailService.sendTaskAssignedEmail(
                assignee.getEmail(),
                assignee.getFirstName(),
                assigner.getFirstName(),
                task.getWorkspace().getName(),
                task.getTitle(),
                dueDate,
                taskLink
        );

        webSocketService.notifyTaskAssignment(task, assignee, assigner);
    }

    public void notifyUserOfWorkspaceInvite(User inviter, User invitedUser, Workspace workspace) {
        String message = inviter.getFirstName() + " convidou você para o workspace '" + workspace.getName() + "'.";

        Notification notification = new Notification();
        notification.setUser(invitedUser);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);

        String inviteLink = "http://localhost:5173/workspaces/join?invite_token=SEU_TOKEN_DE_CONVITE_AQUI";

        emailService.sendWorkspaceInviteEmail(
                invitedUser.getEmail(),
                inviter.getFirstName(),
                workspace.getName(),
                inviteLink
        );

        webSocketService.notifyWorkspaceInvite(workspace, invitedUser, inviter);
    }

    public void notifyMembersOfNewJoinee(Workspace workspace, User newMember) {
        String message = newMember.getFirstName() + " " + newMember.getLastName() + " entrou no workspace.";

        if (!workspace.getOwner().equals(newMember)) {
            createAndSaveNotification(workspace.getOwner(), message);
        }

        workspace.getMembers().forEach(member -> {
            if (!member.getUser().equals(newMember)) {
                createAndSaveNotification(member.getUser(), message);
            }
        });

        webSocketService.notifyWorkspaceActivity(workspace.getId(), message, newMember);
    }

    private void createAndSaveNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }
}