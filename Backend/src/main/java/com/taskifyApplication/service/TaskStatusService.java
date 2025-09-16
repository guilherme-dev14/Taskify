package com.taskifyApplication.service;

import com.taskifyApplication.dto.TaskStatusDto.CreateTaskStatusDTO;
import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.TaskStatusDto.UpdateTaskStatusDTO;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TaskStatus;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.TaskStatusRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskStatusService {

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    public List<TaskStatusDTO> getStatusesForWorkspace(Long workspaceId) {
        User currentUser = userService.getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (!workspaceRepository.accessibleForUser(currentUser, workspaceId)) {
            throw new SecurityException("User does not have access to this workspace");
        }

        return taskStatusRepository.findByWorkspaceOrderByNameAsc(workspace).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskStatusDTO createStatus(CreateTaskStatusDTO createDto) {
        User currentUser = userService.getCurrentUser();
        Workspace workspace = workspaceRepository.findById(createDto.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (!workspaceRepository.accessibleForUser(currentUser, createDto.getWorkspaceId())) {
            throw new SecurityException("User does not have permission to modify this workspace");
        }

        int maxOrder = workspace.getTaskStatuses().stream()
                .mapToInt(s -> s.getOrder() != null ? s.getOrder() : 0)
                .max().orElse(-1);

        TaskStatus newStatus = TaskStatus.builder()
                .name(createDto.getName())
                .color(createDto.getColor())
                .workspace(workspace)
                .order(maxOrder + 1)
                .build();

        TaskStatus savedStatus = taskStatusRepository.save(newStatus);
        return convertToDto(savedStatus);
    }

    public TaskStatusDTO updateStatus(UpdateTaskStatusDTO updateDto) {
        User currentUser = userService.getCurrentUser();
        TaskStatus status = taskStatusRepository.findById(updateDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("TaskStatus not found"));

        if (!workspaceRepository.accessibleForUser(currentUser, status.getWorkspace().getId())) {
            throw new SecurityException("User does not have permission to modify this workspace");
        }

        if (updateDto.getName() != null) {
            status.setName(updateDto.getName());
        }
        if (updateDto.getColor() != null) {
            status.setColor(updateDto.getColor());
        }
        if (updateDto.getOrder() != null) {
            status.setOrder(updateDto.getOrder());
        }

        TaskStatus updatedStatus = taskStatusRepository.save(status);
        return convertToDto(updatedStatus);
    }

    public void deleteStatus(Long statusId) {
        User currentUser = userService.getCurrentUser();
        TaskStatus status = taskStatusRepository.findById(statusId)
                .orElseThrow(() -> new IllegalArgumentException("TaskStatus not found"));

        if (!workspaceRepository.accessibleForUser(currentUser, status.getWorkspace().getId())) {
            throw new SecurityException("User does not have permission to modify this workspace");
        }

        long tasksWithThisStatus = taskRepository.countByStatus(status);
        if (tasksWithThisStatus > 0) {
            throw new IllegalStateException("Cannot delete status. It is currently in use by " + tasksWithThisStatus + " task(s).");
        }

        Workspace workspace = status.getWorkspace();
        if (workspace.getTaskStatuses().size() <= 1) {
            throw new IllegalStateException("Cannot delete the last status of a workspace.");
        }


        workspace.getTaskStatuses().remove(status);

        taskStatusRepository.delete(status);
    }

    private TaskStatusDTO convertToDto(TaskStatus status) {
        return new TaskStatusDTO(status.getId(), status.getName(), status.getColor());
    }
}