package com.taskifyApplication.service;

import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CategorySummaryDTO;
import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceResponseDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceSummaryDTO;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.CategoryRepository;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private WorkspaceRepository workspaceRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;

    public List<TaskSummaryDTO> getAllTasksFromUser() {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskRepository.findByAssignedTo(currentUser);
        return tasks.stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
    }

    public TaskDetailDTO getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view this task");
        }

        return convertToTaskDetailDto(task);
    }

    public TaskResponseDTO createTask(CreateTaskDTO createTaskDTO) {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository.findById(createTaskDTO.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        Category category = categoryRepository.findById(createTaskDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (taskRepository.existsByTitleAndWorkspace(createTaskDTO.getTitle(), workspace)) {
            throw new IllegalStateException("Task with this title already exists in the workspace!");
        }

        Task task = Task.builder()
                .title(createTaskDTO.getTitle())
                .description(createTaskDTO.getDescription())
                .status(StatusTaskEnum.NEW)
                .priority(createTaskDTO.getPriority())
                .dueDate(createTaskDTO.getDueDate())
                .assignedTo(currentUser)
                .workspace(workspace)
                .category(category)
                .build();

        task = taskRepository.save(task);
        return convertToTaskResponseDto(task);
    }

    public void deleteTask(Long taskId){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));
        taskRepository.delete(task);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // In your app, this returns email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // Conversion methods
    private TaskSummaryDTO convertToTaskSummaryDto(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());

        // Null-safe assignment for assignedTo
        if (task.getAssignedTo() != null) {
            dto.setAssignedToName(task.getAssignedTo().getFirstName());
        }

        // Null-safe assignment for category
        if (task.getCategory() != null) {
            dto.setCategoryName(task.getCategory().getName());
        }

        return dto;
    }

    private TaskDetailDTO convertToTaskDetailDto(Task task) {
        TaskDetailDTO dto = new TaskDetailDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setActualHours(task.getActualHours());

        // Convert workspace to WorkspaceResponseDTO
        if (task.getWorkspace() != null) {
            WorkspaceResponseDTO workspaceDto = new WorkspaceResponseDTO();
            workspaceDto.setId(task.getWorkspace().getId());
            workspaceDto.setName(task.getWorkspace().getName());
            workspaceDto.setDescription(task.getWorkspace().getDescription());
            workspaceDto.setCreatedAt(task.getWorkspace().getCreatedAt());
            workspaceDto.setUpdatedAt(task.getWorkspace().getUpdatedAt());
            workspaceDto.setInviteCode(task.getWorkspace().getInviteCode());
            dto.setWorkspace(workspaceDto);
        }

        // Convert category to CategoryResponseDTO
        if (task.getCategory() != null) {
            CategoryResponseDTO categoryDto = new CategoryResponseDTO();
            categoryDto.setId(task.getCategory().getId());
            categoryDto.setName(task.getCategory().getName());
            categoryDto.setDescription(task.getCategory().getDescription());
            categoryDto.setCreatedAt(task.getCategory().getCreatedAt());
            categoryDto.setUpdatedAt(task.getCategory().getUpdatedAt());
            dto.setCategory(categoryDto);
        }

        // Convert assigned user to UserDTO
        if (task.getAssignedTo() != null) {
            UserDTO userDto = new UserDTO();
            userDto.setId(task.getAssignedTo().getId());
            userDto.setFirstName(task.getAssignedTo().getFirstName());
            userDto.setLastName(task.getAssignedTo().getLastName());
            userDto.setEmail(task.getAssignedTo().getEmail());
            userDto.setUsername(task.getAssignedTo().getUsername());
            userDto.setCreatedAt(task.getAssignedTo().getCreatedAt().toOffsetDateTime());
            dto.setAssignedTo(userDto);
        }

        // Calculate additional fields
        if (task.getDueDate() != null) {
            dto.setIsOverdue(task.getDueDate().isBefore(LocalDateTime.now())
                    && task.getStatus() != StatusTaskEnum.COMPLETED);
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        } else {
            dto.setIsOverdue(false);
        }

        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);

        return dto;
    }

    private TaskResponseDTO convertToTaskResponseDto(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());

        // Convert workspace to summary
        if (task.getWorkspace() != null) {
            WorkspaceSummaryDTO workspaceDto = new WorkspaceSummaryDTO();
            workspaceDto.setId(task.getWorkspace().getId());
            workspaceDto.setName(task.getWorkspace().getName());
            dto.setWorkspace(workspaceDto);
        }

        // Convert category to summary
        if (task.getCategory() != null) {
            CategorySummaryDTO categoryDto = new CategorySummaryDTO();
            categoryDto.setId(task.getCategory().getId());
            categoryDto.setName(task.getCategory().getName());
            dto.setCategory(categoryDto);
        }

        // Convert assigned user to summary
        if (task.getAssignedTo() != null) {
            UserSummaryDTO userDto = new UserSummaryDTO();
            userDto.setId(task.getAssignedTo().getId());
            userDto.setFirstName(task.getAssignedTo().getFirstName());
            userDto.setLastName(task.getAssignedTo().getLastName());
            userDto.setEmail(task.getAssignedTo().getEmail());
            dto.setAssignedTo(userDto);
        }

        // Calculate additional fields
        if (task.getDueDate() != null) {
            dto.setIsOverdue(task.getDueDate().isBefore(LocalDateTime.now())
                    && task.getStatus() != StatusTaskEnum.COMPLETED);
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        } else {
            dto.setIsOverdue(false);
        }

        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);

        return dto;
    }
}