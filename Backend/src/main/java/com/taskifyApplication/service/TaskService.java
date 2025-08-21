package com.taskifyApplication.service;

import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceResponseDTO;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.CategoryRepository;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    // region REPOSITORIES
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private WorkspaceRepository workspaceRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;
    // endregion

    // region PUBLIC FUNCTIONS SERVICE
    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Task> taskPage = taskRepository.findByAssignedTo(currentUser, pageable);
        
        List<TaskSummaryDTO> taskSummaries = taskPage.getContent().stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
                
        return PageResponse.<TaskSummaryDTO>builder()
                .content(taskSummaries)
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .first(taskPage.isFirst())
                .last(taskPage.isLast())
                .empty(taskPage.isEmpty())
                .build();
    }

    public TaskDetailDTO getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view this task");
        }

        TaskDetailDTO dto = convertToTaskDetailDto(task);
        
        // Calcular campos adicionais manualmente
        if (task.getAssignedTo() != null) {
            dto.getAssignedTo().setCreatedAt(task.getAssignedTo().getCreatedAt().toOffsetDateTime());
        }
        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);
        dto.setIsOverdue(task.getDueDate() != null && 
                        task.getDueDate().isBefore(LocalDateTime.now()) && 
                        task.getStatus() != StatusTaskEnum.COMPLETED);
        if (task.getDueDate() != null) {
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        }
        
        return dto;
    }

    public TaskResponseDTO createTask(CreateTaskDTO createTaskDTO) {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository.findById(createTaskDTO.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        Category category = null;
        if (createTaskDTO.getCategoryId() != null) {
            category = categoryRepository.findById(createTaskDTO.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        }

        if (taskRepository.existsByTitleAndWorkspace(createTaskDTO.getTitle(), workspace)) {
            throw new IllegalStateException("Task with this title already exists in the workspace!");
        }

        Task task = Task.builder()
                .title(createTaskDTO.getTitle())
                .description(createTaskDTO.getDescription())
                .status(StatusTaskEnum.NEW)
                .priority(createTaskDTO.getPriority() != null ? createTaskDTO.getPriority() : PriorityEnum.MEDIUM)
                .dueDate(createTaskDTO.getDueDate())
                .assignedTo(currentUser)
                .workspace(workspace)
                .category(category)
                .build();

        task = taskRepository.save(task);
        
        TaskResponseDTO dto = convertToTaskResponseDto(task);
        dto.setCommentsCount(0);
        dto.setIsOverdue(false);
        if (task.getDueDate() != null) {
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        }
        
        return dto;
    }

    public void deleteTask(Long taskId){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));
        taskRepository.delete(task);
    }

    public TaskResponseDTO updateTask(Long taskId, UpdateTaskDTO updateTaskDTO) {
        User currentUser = getCurrentUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to edit this task");
        }

        if (updateTaskDTO.getTitle() != null) {
            if (!task.getTitle().equals(updateTaskDTO.getTitle()) &&
                    taskRepository.existsByTitleAndWorkspace(updateTaskDTO.getTitle(), task.getWorkspace())) {
                throw new IllegalStateException("Task with this title already exists in the workspace!");
            }
            task.setTitle(updateTaskDTO.getTitle());
        }

        if (updateTaskDTO.getDescription() != null) {
            task.setDescription(updateTaskDTO.getDescription());
        }

        if (updateTaskDTO.getStatus() != null) {
            task.setStatus(updateTaskDTO.getStatus());
        }

        if (updateTaskDTO.getPriority() != null) {
            task.setPriority(updateTaskDTO.getPriority());
        }

        if (updateTaskDTO.getDueDate() != null) {
            task.setDueDate(updateTaskDTO.getDueDate());
        }

        if (updateTaskDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updateTaskDTO.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + updateTaskDTO.getCategoryId()));
            task.setCategory(category);
        }

        if (updateTaskDTO.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(updateTaskDTO.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + updateTaskDTO.getAssignedToId()));
            task.setAssignedTo(assignedUser);
        }
        task = taskRepository.save(task);

        TaskResponseDTO dto = convertToTaskResponseDto(task);
        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);
        dto.setIsOverdue(task.getDueDate() != null && 
                        task.getDueDate().isBefore(LocalDateTime.now()) && 
                        task.getStatus() != StatusTaskEnum.COMPLETED);
        if (task.getDueDate() != null) {
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        }
        
        return dto;
    }

    //endregion

    // region PRIVATE AUXILIAR FUNCTIONS

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private TaskSummaryDTO convertToTaskSummaryDto(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());

        if (task.getAssignedTo() != null) {
            dto.setAssignedToName(task.getAssignedTo().getFirstName());
        }

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

        if (task.getWorkspace() != null) {
            WorkspaceResponseDTO workspaceDto = new WorkspaceResponseDTO();
            workspaceDto.setName(task.getWorkspace().getName());
            workspaceDto.setDescription(task.getWorkspace().getDescription());
            workspaceDto.setCreatedAt(task.getWorkspace().getCreatedAt());
            workspaceDto.setUpdatedAt(task.getWorkspace().getUpdatedAt());
            workspaceDto.setInviteCode(task.getWorkspace().getInviteCode());
            dto.setWorkspace(workspaceDto);
        }

        if (task.getCategory() != null) {
            CategoryResponseDTO categoryDto = new CategoryResponseDTO();
            categoryDto.setId(task.getCategory().getId());
            categoryDto.setName(task.getCategory().getName());
            categoryDto.setDescription(task.getCategory().getDescription());
            dto.setCategory(categoryDto);
        }

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

        if (task.getWorkspace() != null) {
            WorkspaceNameDTO workspaceDto = new WorkspaceNameDTO();
            workspaceDto.setId(task.getWorkspace().getId());
            workspaceDto.setName(task.getWorkspace().getName());
            dto.setWorkspace(workspaceDto);
        }

        if (task.getCategory() != null) {
            CategoryResponseDTO categoryDto = new CategoryResponseDTO();
            categoryDto.setId(task.getCategory().getId());
            categoryDto.setName(task.getCategory().getName());
            dto.setCategory(categoryDto);
        }

        if (task.getAssignedTo() != null) {
            UserSummaryDTO userDto = new UserSummaryDTO();
            userDto.setId(task.getAssignedTo().getId());
            userDto.setFirstName(task.getAssignedTo().getFirstName());
            userDto.setLastName(task.getAssignedTo().getLastName());
            userDto.setEmail(task.getAssignedTo().getEmail());
            dto.setAssignedTo(userDto);
        }

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
    // endregion
}