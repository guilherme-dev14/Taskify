package com.taskifyApplication.service;

import com.taskifyApplication.dto.AttachmentDto.AttachmentResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private WebSocketService webSocketService;
    // endregion

    // region PUBLIC FUNCTIONS SERVICE
    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable) {
        return getAllTasksFromUser(pageable, null);
    }

    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable, Long workspaceId, StatusTaskEnum status, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        
        Page<Task> taskPage;
        
        if (workspaceId != null || status != null || priority != null) {
            taskPage = taskRepository.findTasksWithFilters(currentUser, workspaceId, status, priority, pageable);
        } else {
            taskPage = taskRepository.findByAssignedTo(currentUser, pageable);
        }
        
        List<TaskSummaryDTO> taskSummaries = taskPage.getContent().stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());

        return PageResponse.<TaskSummaryDTO>builder()
                .content(taskSummaries)
                .totalElements(taskPage.getTotalElements())
                .page(taskPage.getNumber())
                .totalPages(taskPage.getTotalPages())
                .size(taskPage.getSize())
                .first(taskPage.isFirst())
                .last(taskPage.isLast())
                .empty(taskPage.isEmpty())
                .build();
    }

    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable, Long workspaceId) {
        return getAllTasksFromUser(pageable, workspaceId, null, null);
    }

    public PageResponse<TaskSummaryDTO> getAllTasksFromWorkspace(Long workspaceId, Pageable pageable, StatusTaskEnum status, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        if (!workspaceRepository.accessibleForUser(currentUser, workspaceId)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        Page<Task> taskPage;
        if (status != null || priority != null) {
            taskPage = taskRepository.findByWorkspaceWithFiltersPageable(workspace, status, priority, pageable);
        } else {
            taskPage = taskRepository.findByWorkspace(workspace, pageable);
        }
        
        List<TaskSummaryDTO> taskSummaries = taskPage.getContent().stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());

        return PageResponse.<TaskSummaryDTO>builder()
                .content(taskSummaries)
                .totalElements(taskPage.getTotalElements())
                .page(taskPage.getNumber())
                .totalPages(taskPage.getTotalPages())
                .size(taskPage.getSize())
                .first(taskPage.isFirst())
                .last(taskPage.isLast())
                .empty(taskPage.isEmpty())
                .build();
    }

    public PageResponse<TaskSummaryDTO> getAllTasksFromWorkspace(Long workspaceId, Pageable pageable) {
        return getAllTasksFromWorkspace(workspaceId, pageable, null, null);
    }
    
    private PageResponse<TaskSummaryDTO> getAllTasksFromUserOld(Pageable pageable, Long workspaceId) {
        User currentUser = getCurrentUser();
        
        Page<Task> taskPage;
        
        if (workspaceId != null) {
            taskPage = taskRepository.findByAssignedToAndWorkspaceId(currentUser, workspaceId, pageable);
        } else {
            taskPage = taskRepository.findByAssignedTo(currentUser, pageable);
        }


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

        List<Category> categories = new ArrayList<>();
        if (createTaskDTO.getCategoryIds() != null && !createTaskDTO.getCategoryIds().isEmpty()) {
            categories = categoryRepository.findAllById(createTaskDTO.getCategoryIds());
            if (categories.size() != createTaskDTO.getCategoryIds().size()) {
                throw new IllegalArgumentException("Some categories not found");
            }
        }

        if (taskRepository.existsByTitleAndWorkspace(createTaskDTO.getTitle(), workspace)) {
            throw new IllegalStateException("Task with this title already exists in the workspace!");
        }

        StatusTaskEnum finalStatus = createTaskDTO.getStatus() != null ? createTaskDTO.getStatus() : StatusTaskEnum.NEW;
        
        Task task = Task.builder()
                .title(createTaskDTO.getTitle())
                .description(createTaskDTO.getDescription())
                .status(finalStatus)
                .priority(createTaskDTO.getPriority() != null ? createTaskDTO.getPriority() : PriorityEnum.MEDIUM)
                .dueDate(createTaskDTO.getDueDate())
                .assignedTo(currentUser)
                .workspace(workspace)
                .categories(categories)
                .build();

        task = taskRepository.save(task);

        // Create notification if task is assigned to someone other than creator
        if (task.getAssignedTo() != null && !task.getAssignedTo().equals(currentUser)) {
            notificationService.notifyTaskAssigned(task.getAssignedTo(), task, currentUser);
        }

        // Send WebSocket notification for real-time updates
        webSocketService.notifyWorkspaceTaskUpdate(
            workspace.getId(), 
            convertToTaskSummaryDto(task), 
            "CREATED", 
            currentUser
        );

        TaskResponseDTO dto = convertToTaskResponseDto(task);
        dto.setCommentsCount(0);
        dto.setIsOverdue(false);
        if (task.getDueDate() != null) {
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        }

        return dto;
    }

    public void deleteTask(Long taskId) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));
        
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to delete this task");
        }
        
        // Send WebSocket notification before deletion
        webSocketService.notifyWorkspaceTaskUpdate(
            task.getWorkspace().getId(), 
            convertToTaskSummaryDto(task), 
            "DELETED", 
            currentUser
        );
        
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
        
        if (updateTaskDTO.getNotes() != null) {
            task.setNotes(updateTaskDTO.getNotes());
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

        if (updateTaskDTO.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(updateTaskDTO.getCategoryIds());
            if (categories.size() != updateTaskDTO.getCategoryIds().size()) {
                throw new IllegalArgumentException("Some categories not found");
            }
            task.setCategories(categories);
        }

        User previousAssignedUser = task.getAssignedTo();
        if (updateTaskDTO.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(updateTaskDTO.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + updateTaskDTO.getAssignedToId()));
            task.setAssignedTo(assignedUser);
        }
        
        task = taskRepository.save(task);

        // Create notifications for task updates
        User newAssignedUser = task.getAssignedTo();
        
        // Notify if task was newly assigned to someone
        if (newAssignedUser != null && 
            !newAssignedUser.equals(currentUser) && 
            !newAssignedUser.equals(previousAssignedUser)) {
            notificationService.notifyTaskAssigned(newAssignedUser, task, currentUser);
        }
        
        // Notify previous assignee about task updates (if different from current user and new assignee)
        if (previousAssignedUser != null && 
            !previousAssignedUser.equals(currentUser) && 
            !previousAssignedUser.equals(newAssignedUser)) {
            notificationService.notifyTaskUpdated(previousAssignedUser, task, currentUser, "Task details updated");
        }
        
        // Notify current assignee about task updates (if different from current user)
        if (newAssignedUser != null && 
            !newAssignedUser.equals(currentUser) && 
            newAssignedUser.equals(previousAssignedUser)) {
            notificationService.notifyTaskUpdated(newAssignedUser, task, currentUser, "Task details updated");
        }
        
        // Notify about task completion
        if (updateTaskDTO.getStatus() == StatusTaskEnum.COMPLETED && 
            newAssignedUser != null && 
            !newAssignedUser.equals(currentUser)) {
            notificationService.notifyTaskCompleted(newAssignedUser, task, currentUser);
        }
        
        // Send WebSocket notification for real-time updates
        String action = newAssignedUser != null && !newAssignedUser.equals(previousAssignedUser) ? "ASSIGNED" : "UPDATED";
        webSocketService.notifyWorkspaceTaskUpdate(
            task.getWorkspace().getId(), 
            convertToTaskSummaryDto(task), 
            action, 
            currentUser
        );

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

    public DashboardStatsDTO getDashboardStats() {
        User currentUser = getCurrentUser();
        DashboardStatsDTO dashboardStats = new DashboardStatsDTO();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        dashboardStats.setTotalTasks(taskRepository.findByAssignedTo(currentUser).size());
        dashboardStats.setToDoToday(taskRepository.countTasksDueToday(currentUser, startOfDay, endOfDay, StatusTaskEnum.COMPLETED));
        dashboardStats.setOverdue(taskRepository.countOverdueTasks(currentUser, LocalDateTime.now(), StatusTaskEnum.COMPLETED));
        dashboardStats.setInProgress(taskRepository.countByStatus(StatusTaskEnum.IN_PROGRESS));
        return dashboardStats;
    }

    public List<TaskSummaryDTO> getAllTasksByStatus(StatusTaskEnum status, Long workspaceId) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = null;
        if (workspaceId != null) {
            workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        }
        
        List<Task> tasks = taskRepository.findByStatusWorkspaceAndAssignedTo(status, currentUser, workspace);

        return tasks.stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
    }


    //endregion

    // region PRIVATE AUXILIAR FUNCTIONS

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public TaskSummaryDTO convertToTaskSummaryDto(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setProgress(task.getProgress());
        dto.setHasAttachments(task.getAttachments() != null && !task.getAttachments().isEmpty());

        if (task.getAssignedTo() != null) {
            dto.setAssignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName());
            
            UserSummaryDTO assignedUser = new UserSummaryDTO();
            assignedUser.setId(task.getAssignedTo().getId());
            assignedUser.setUsername(task.getAssignedTo().getUsername());
            assignedUser.setFirstName(task.getAssignedTo().getFirstName());
            assignedUser.setLastName(task.getAssignedTo().getLastName());
            assignedUser.setEmail(task.getAssignedTo().getEmail());
            assignedUser.setProfilePictureUrl(task.getAssignedTo().getProfilePictureUrl());
            dto.setAssignedTo(assignedUser);
        }

        if (task.getCategories() != null && !task.getCategories().isEmpty()) {
            dto.setCategoryNames(task.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private TaskDetailDTO convertToTaskDetailDto(Task task) {
        TaskDetailDTO dto = new TaskDetailDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setNotes(task.getNotes());
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

        if (task.getCategories() != null && !task.getCategories().isEmpty()) {
            List<CategoryResponseDTO> categoryDtos = task.getCategories().stream()
                    .map(category -> {
                        CategoryResponseDTO categoryDto = new CategoryResponseDTO();
                        categoryDto.setId(category.getId());
                        categoryDto.setName(category.getName());
                        categoryDto.setDescription(category.getDescription());
                        return categoryDto;
                    })
                    .collect(Collectors.toList());
            dto.setCategories(categoryDtos);
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
        
        // Add attachment information
        if (task.getAttachments() != null && !task.getAttachments().isEmpty()) {
            dto.setAttachments(task.getAttachments().stream()
                    .map(this::convertToAttachmentResponseDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
    
    private AttachmentResponseDTO convertToAttachmentResponseDto(Attachment attachment) {
        AttachmentResponseDTO dto = new AttachmentResponseDTO();
        dto.setId(attachment.getId());
        dto.setFilename(attachment.getFilename());
        dto.setOriginalName(attachment.getOriginalName());
        dto.setMimeType(attachment.getMimeType());
        dto.setSize(attachment.getSize());
        dto.setStorageUrl(attachment.getStorageUrl());
        dto.setThumbnailUrl(attachment.getThumbnailUrl());
        dto.setUploadedAt(attachment.getUploadedAt());
        dto.setDescription(attachment.getDescription());
        dto.setVersion(attachment.getVersion());
        dto.setIsLatestVersion(attachment.getIsLatestVersion());
        
        if (attachment.getUploadedBy() != null) {
            dto.setUploadedByName(attachment.getUploadedBy().getFirstName() + " " + attachment.getUploadedBy().getLastName());
            dto.setUploadedById(attachment.getUploadedBy().getId());
        }
        
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

        if (task.getCategories() != null && !task.getCategories().isEmpty()) {
            List<CategoryResponseDTO> categoryDtos = task.getCategories().stream()
                    .map(category -> {
                        CategoryResponseDTO categoryDto = new CategoryResponseDTO();
                        categoryDto.setId(category.getId());
                        categoryDto.setName(category.getName());
                        return categoryDto;
                    })
                    .collect(Collectors.toList());
            dto.setCategories(categoryDtos);
        }

        if (task.getAssignedTo() != null) {
            UserSummaryDTO userDto = new UserSummaryDTO();
            userDto.setId(task.getAssignedTo().getId());
            userDto.setUsername(task.getAssignedTo().getUsername());
            userDto.setFirstName(task.getAssignedTo().getFirstName());
            userDto.setLastName(task.getAssignedTo().getLastName());
            userDto.setEmail(task.getAssignedTo().getEmail());
            userDto.setProfilePictureUrl(task.getAssignedTo().getProfilePictureUrl());
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

    // Workspace-wide task methods for collaborative view
    public PageResponse<TaskSummaryDTO> getAllTasksInWorkspace(Long workspaceId, Pageable pageable) {
        return getAllTasksInWorkspace(workspaceId, null, null, pageable);
    }

    public PageResponse<TaskSummaryDTO> getAllTasksInWorkspace(Long workspaceId, StatusTaskEnum status, 
                                                              PriorityEnum priority, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
                
        // Verify user has access to this workspace
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        Page<Task> taskPage;
        if (status != null || priority != null) {
            taskPage = taskRepository.findByWorkspaceWithFiltersPageable(workspace, status, priority, pageable);
        } else {
            taskPage = taskRepository.findByWorkspace(workspace, pageable);
        }

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

    public List<TaskSummaryDTO> getAllTasksInWorkspaceList(Long workspaceId) {
        return getAllTasksInWorkspaceList(workspaceId, null, null);
    }

    public List<TaskSummaryDTO> getAllTasksInWorkspaceList(Long workspaceId, StatusTaskEnum status, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
                
        // Verify user has access to this workspace
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        List<Task> tasks;
        if (status != null || priority != null) {
            tasks = taskRepository.findByWorkspaceWithFilters(workspace, status, priority);
        } else {
            tasks = taskRepository.findByWorkspace(workspace);
        }

        return tasks.stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
    }

    // Helper method to check workspace access
    private boolean canUserAccessWorkspace(Workspace workspace, User user) {
        // Check if user is owner
        if (workspace.getOwner().equals(user)) {
            return true;
        }
        
        // Check if user is a member
        return workspace.getMembers().stream()
                .anyMatch(member -> member.getUser().equals(user));
    }

    // BULK OPERATIONS
    public List<TaskResponseDTO> bulkUpdateTasks(BulkTaskOperationDTO bulkUpdateDTO) {
        User currentUser = getCurrentUser();
        
        List<Task> tasks = taskRepository.findAllById(bulkUpdateDTO.getTaskIds());
        
        if (tasks.size() != bulkUpdateDTO.getTaskIds().size()) {
            throw new IllegalArgumentException("Some tasks were not found");
        }
        
        // Verify permissions for all tasks
        for (Task task : tasks) {
            if (!task.canEdit(currentUser)) {
                throw new IllegalArgumentException("You don't have permission to edit task: " + task.getTitle());
            }
        }
        
        User assignedUser = null;
        if (bulkUpdateDTO.getAssignedToId() != null) {
            assignedUser = userRepository.findById(bulkUpdateDTO.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found"));
        }
        
        List<Category> categories = null;
        if (bulkUpdateDTO.getCategoryIds() != null && !bulkUpdateDTO.getCategoryIds().isEmpty()) {
            categories = categoryRepository.findAllById(bulkUpdateDTO.getCategoryIds());
            if (categories.size() != bulkUpdateDTO.getCategoryIds().size()) {
                throw new IllegalArgumentException("Some categories not found");
            }
        }
        
        // Apply bulk updates
        for (Task task : tasks) {
            if (bulkUpdateDTO.getStatus() != null) {
                task.setStatus(bulkUpdateDTO.getStatus());
            }
            if (bulkUpdateDTO.getPriority() != null) {
                task.setPriority(bulkUpdateDTO.getPriority());
            }
            if (assignedUser != null) {
                task.setAssignedTo(assignedUser);
            }
            if (categories != null) {
                task.setCategories(new ArrayList<>(categories));
            }
        }
        
        List<Task> updatedTasks = taskRepository.saveAll(tasks);
        
        // Send WebSocket notifications for each task
        for (Task task : updatedTasks) {
            webSocketService.notifyWorkspaceTaskUpdate(
                task.getWorkspace().getId(),
                convertToTaskSummaryDto(task),
                "UPDATED",
                currentUser
            );
        }
        
        return updatedTasks.stream()
                .map(this::convertToTaskResponseDto)
                .collect(Collectors.toList());
    }
    
    public void bulkDeleteTasks(List<Long> taskIds) {
        User currentUser = getCurrentUser();
        
        List<Task> tasks = taskRepository.findAllById(taskIds);
        
        // Verify permissions for all tasks
        for (Task task : tasks) {
            if (!task.canEdit(currentUser)) {
                throw new IllegalArgumentException("You don't have permission to delete task: " + task.getTitle());
            }
        }
        
        // Send WebSocket notifications before deletion
        for (Task task : tasks) {
            webSocketService.notifyWorkspaceTaskUpdate(
                task.getWorkspace().getId(),
                convertToTaskSummaryDto(task),
                "DELETED",
                currentUser
            );
        }
        
        taskRepository.deleteAll(tasks);
    }
    
    public TaskResponseDTO cloneTask(Long taskId) {
        User currentUser = getCurrentUser();
        
        Task originalTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        if (!originalTask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to clone this task");
        }
        
        // Create clone with "Copy of" prefix
        Task clonedTask = Task.builder()
                .title("Copy of " + originalTask.getTitle())
                .description(originalTask.getDescription())
                .status(StatusTaskEnum.NEW) // Always start as NEW
                .priority(originalTask.getPriority())
                .assignedTo(currentUser) // Assign to current user
                .workspace(originalTask.getWorkspace())
                .categories(new ArrayList<>(originalTask.getCategories()))
                .estimatedHours(originalTask.getEstimatedHours())
                .build();
        
        clonedTask = taskRepository.save(clonedTask);
        
        // Send WebSocket notification
        webSocketService.notifyWorkspaceTaskUpdate(
            originalTask.getWorkspace().getId(),
            convertToTaskSummaryDto(clonedTask),
            "CREATED",
            currentUser
        );
        
        return convertToTaskResponseDto(clonedTask);
    }
    
    // SUBTASK MANAGEMENT
    public TaskResponseDTO createSubtask(CreateSubtaskDTO createSubtaskDTO) {
        User currentUser = getCurrentUser();
        
        Task parentTask = taskRepository.findById(createSubtaskDTO.getParentTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Parent task not found"));
        
        if (!parentTask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to create subtasks for this task");
        }
        
        User assignedUser = currentUser;
        if (createSubtaskDTO.getAssignedToId() != null) {
            assignedUser = userRepository.findById(createSubtaskDTO.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found"));
        }
        
        List<Category> categories = new ArrayList<>();
        if (createSubtaskDTO.getCategoryIds() != null && !createSubtaskDTO.getCategoryIds().isEmpty()) {
            categories = categoryRepository.findAllById(createSubtaskDTO.getCategoryIds());
            if (categories.size() != createSubtaskDTO.getCategoryIds().size()) {
                throw new IllegalArgumentException("Some categories not found");
            }
        }
        
        Task subtask = Task.builder()
                .title(createSubtaskDTO.getTitle())
                .description(createSubtaskDTO.getDescription())
                .status(createSubtaskDTO.getStatus())
                .priority(createSubtaskDTO.getPriority())
                .dueDate(createSubtaskDTO.getDueDate())
                .assignedTo(assignedUser)
                .workspace(parentTask.getWorkspace())
                .parentTask(parentTask)
                .categories(categories)
                .estimatedHours(createSubtaskDTO.getEstimatedHours())
                .build();
        
        subtask = taskRepository.save(subtask);
        
        // Notify workspace members
        webSocketService.notifyWorkspaceTaskUpdate(
            parentTask.getWorkspace().getId(),
            convertToTaskSummaryDto(subtask),
            "CREATED",
            currentUser
        );
        
        return convertToTaskResponseDto(subtask);
    }
    
    public List<TaskSummaryDTO> getSubtasks(Long parentTaskId) {
        Task parentTask = taskRepository.findById(parentTaskId)
                .orElseThrow(() -> new IllegalArgumentException("Parent task not found"));
        
        User currentUser = getCurrentUser();
        if (!parentTask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view subtasks");
        }
        
        return parentTask.getSubtasks().stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
    }
    
    public TaskSummaryDTO getParentTask(Long subtaskId) {
        Task subtask = taskRepository.findById(subtaskId)
                .orElseThrow(() -> new IllegalArgumentException("Subtask not found"));
        
        User currentUser = getCurrentUser();
        if (!subtask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view this task");
        }
        
        if (subtask.getParentTask() == null) {
            throw new IllegalArgumentException("This task is not a subtask");
        }
        
        return convertToTaskSummaryDto(subtask.getParentTask());
    }
    
    public void convertToSubtask(Long taskId, Long parentTaskId) {
        User currentUser = getCurrentUser();
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        Task parentTask = taskRepository.findById(parentTaskId)
                .orElseThrow(() -> new IllegalArgumentException("Parent task not found"));
        
        if (!task.canEdit(currentUser) || !parentTask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to modify these tasks");
        }
        
        if (task.getId().equals(parentTask.getId())) {
            throw new IllegalArgumentException("A task cannot be a subtask of itself");
        }
        
        // Ensure they're in the same workspace
        if (!task.getWorkspace().getId().equals(parentTask.getWorkspace().getId())) {
            throw new IllegalArgumentException("Tasks must be in the same workspace");
        }
        
        task.setParentTask(parentTask);
        taskRepository.save(task);
        
        webSocketService.notifyWorkspaceTaskUpdate(
            task.getWorkspace().getId(),
            convertToTaskSummaryDto(task),
            "UPDATED",
            currentUser
        );
    }
    
    public void promoteToMainTask(Long subtaskId) {
        User currentUser = getCurrentUser();
        
        Task subtask = taskRepository.findById(subtaskId)
                .orElseThrow(() -> new IllegalArgumentException("Subtask not found"));
        
        if (!subtask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to modify this task");
        }
        
        if (subtask.getParentTask() == null) {
            throw new IllegalArgumentException("This task is not a subtask");
        }
        
        subtask.setParentTask(null);
        taskRepository.save(subtask);
        
        webSocketService.notifyWorkspaceTaskUpdate(
            subtask.getWorkspace().getId(),
            convertToTaskSummaryDto(subtask),
            "UPDATED",
            currentUser
        );
    }
    
    // endregion
}