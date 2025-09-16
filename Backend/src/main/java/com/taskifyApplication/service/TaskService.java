package com.taskifyApplication.service;

import com.taskifyApplication.dto.AttachmentDto.AttachmentResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceResponseDTO;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private ValidationService validationService;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private ActivityService activityService;
    @Autowired
    private AttachmentService attachmentService;
    @Autowired
    private TimeTrackingRepository timeTrackingRepository;
    @Autowired
    private TaskStatusRepository taskStatusRepository;
    @PersistenceContext
    private EntityManager entityManager;
    // endregion

    // region PUBLIC FUNCTIONS SERVICE
    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable) {
        return getAllTasksFromUser(pageable, null);
    }

    public PageResponse<TaskSummaryDTO> getAllTasksFromUser(Pageable pageable, Long workspaceId, Long statusId, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        
        Page<Task> taskPage;
        
        if (workspaceId != null || statusId != null || priority != null) {
            taskPage = taskRepository.findTasksWithFilters(currentUser, workspaceId, statusId, priority, pageable);
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

    public PageResponse<TaskSummaryDTO> getAllTasksFromWorkspace(Long workspaceId, Pageable pageable, Long statusId, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        if (!workspaceRepository.accessibleForUser(currentUser, workspaceId)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        Page<Task> taskPage;
        if (statusId != null || priority != null) {
            taskPage = taskRepository.findByWorkspaceWithFiltersPageable(workspace, statusId, priority, pageable);
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
        if (!task.canView(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view this task");
        }

        TaskDetailDTO dto = convertToTaskDetailDto(task);

        if (task.getAssignedTo() != null) {
            dto.getAssignedTo().setCreatedAt(task.getAssignedTo().getCreatedAt().toOffsetDateTime());
        }
        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);
        // CORRIGIDO: Lógica de verificação de status para usar o nome do objeto TaskStatus
        dto.setIsOverdue(task.getDueDate() != null &&
                task.getDueDate().isBefore(LocalDateTime.now()) &&
                (task.getStatus() != null && !task.getStatus().getName().equalsIgnoreCase("COMPLETED")));
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
        }

        if (taskRepository.existsByTitleAndWorkspace(createTaskDTO.getTitle(), workspace)) {
            throw new IllegalStateException("Task with this title already exists in the workspace!");
        }

        // CORRIGIDO: Busca o status padrão do workspace ou o status fornecido
        TaskStatus status;
        if (createTaskDTO.getStatusId() != null) {
            status = taskStatusRepository.findById(createTaskDTO.getStatusId())
                    .orElseThrow(() -> new IllegalArgumentException("Status not found"));
            if (!status.getWorkspace().getId().equals(workspace.getId())) {
                throw new IllegalArgumentException("The provided status does not belong to this workspace.");
            }
        } else {
            // Se nenhum status for fornecido, usa o primeiro status padrão do workspace
            status = workspace.getTaskStatuses().stream()
                    .min((s1, s2) -> Integer.compare(s1.getOrder(), s2.getOrder()))
                    .orElseThrow(() -> new IllegalStateException("Workspace does not have any default statuses."));
        }

        String sanitizedTitle = validationService.sanitizeString(createTaskDTO.getTitle());
        String sanitizedDescription = validationService.sanitizeHtml(createTaskDTO.getDescription());

        Task task = Task.builder()
                .title(sanitizedTitle)
                .description(sanitizedDescription)
                .status(status) // Define o objeto TaskStatus
                .priority(createTaskDTO.getPriority() != null ? createTaskDTO.getPriority() : PriorityEnum.MEDIUM)
                .dueDate(createTaskDTO.getDueDate())
                .assignedTo(currentUser)
                .workspace(workspace)
                .categories(categories)
                .build();

        task = taskRepository.save(task);

        if (createTaskDTO.getAttachments() != null && !createTaskDTO.getAttachments().isEmpty()) {
            final Task savedTask = task;
            createTaskDTO.getAttachments().forEach(file ->
                    attachmentService.uploadAttachment(file, savedTask.getId(), savedTask.getWorkspace().getId(), null, currentUser));
            entityManager.refresh(task);
        }

        activityService.logTaskCreated(task, currentUser);

        if (task.getAssignedTo() != null && !task.getAssignedTo().equals(currentUser)) {
            notificationService.notifyTaskAssigned(task.getAssignedTo(), task, currentUser);
        }

        webSocketService.notifyWorkspaceTaskUpdate(
                workspace.getId(),
                convertToTaskSummaryDto(task),
                "CREATED",
                currentUser
        );

        return convertToTaskResponseDto(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));
        
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to delete this task");
        }

        List<TimeTracking> timeTrackings = timeTrackingRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        if(!timeTrackings.isEmpty()){
            timeTrackingRepository.deleteByTaskId(taskId);
        }
        
        try {
            // First clear all foreign key references to avoid cascade issues
            // Clear activities references
            entityManager.createQuery("UPDATE Activity a SET a.task = null WHERE a.task.id = :taskId")
                    .setParameter("taskId", taskId)
                    .executeUpdate();
            
            // Clear parent task references for subtasks
            entityManager.createQuery("UPDATE Task t SET t.parentTask = null WHERE t.parentTask.id = :taskId")
                    .setParameter("taskId", taskId)
                    .executeUpdate();
            
            // Now delete the task
            taskRepository.deleteById(taskId);
            
        } catch (Exception e) {
            throw new RuntimeException("Error deleting task: " + e.getMessage(), e);
        }
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
            task.setTitle(validationService.sanitizeString(updateTaskDTO.getTitle()));
        }

        if (updateTaskDTO.getDescription() != null) {
            task.setDescription(validationService.sanitizeHtml(updateTaskDTO.getDescription()));
        }

        if (updateTaskDTO.getNotes() != null) {
            task.setNotes(validationService.sanitizeHtml(updateTaskDTO.getNotes()));
        }

        if (updateTaskDTO.getStatusId() != null) {
            TaskStatus newStatus = taskStatusRepository.findById(updateTaskDTO.getStatusId())
                    .orElseThrow(() -> new IllegalArgumentException("Status not found"));
            if (!newStatus.getWorkspace().getId().equals(task.getWorkspace().getId())) {
                throw new IllegalArgumentException("The provided status does not belong to this task's workspace.");
            }
            task.setStatus(newStatus);
        }

        if (updateTaskDTO.getPriority() != null) {
            task.setPriority(updateTaskDTO.getPriority());
        }

        if (updateTaskDTO.getDueDate() != null) {
            task.setDueDate(updateTaskDTO.getDueDate());
        }

        if (updateTaskDTO.getEstimatedHours() != null) {
            task.setEstimatedHours(updateTaskDTO.getEstimatedHours());
        }

        if (updateTaskDTO.getActualHours() != null) {
            task.setActualHours(updateTaskDTO.getActualHours());
        }

        if (updateTaskDTO.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(updateTaskDTO.getCategoryIds());
            if (categories.size() != updateTaskDTO.getCategoryIds().size()) {
                throw new IllegalArgumentException("Some categories not found");
            }
            task.setCategories(categories);
        }

        User previousAssignedUser = task.getAssignedTo();
        
        if (updateTaskDTO.getWorkspaceId() != null) {
            Workspace workspace = workspaceRepository.findById(updateTaskDTO.getWorkspaceId())
                    .orElseThrow(() -> new IllegalArgumentException("Workspace not found with id: " + updateTaskDTO.getWorkspaceId()));
            task.setWorkspace(workspace);
         }
        
        // Then update assignee with the correct workspace context
        if (updateTaskDTO.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(updateTaskDTO.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + updateTaskDTO.getAssignedToId()));

            // Check if user is a member of the workspace
            if (task.getWorkspace() != null) {
                boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(task.getWorkspace(), assignedUser);
                if (!isMember) {
                    throw new IllegalArgumentException("User with id " + updateTaskDTO.getAssignedToId() + " is not a member of this workspace");
                }
            }

            task.setAssignedTo(assignedUser);
        }
        
        task = taskRepository.save(task);

        // Log activity
        activityService.logTaskUpdated(task, currentUser);
        
        // Check if task was completed and log that too
        if (task.getStatus() != null && task.getStatus().getName().equalsIgnoreCase("COMPLETED")) {
            task.setCompletedAt(java.time.OffsetDateTime.now());
            taskRepository.save(task);
            activityService.logTaskCompleted(task, currentUser);
        }


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
        if (task.getStatus().getName().equalsIgnoreCase("COMPLETED") &&
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
                task.getStatus().getName().equalsIgnoreCase("COMPLETED"));
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

        // Nomes de status que consideramos como "concluídos" para as contagens
        List<String> completedStatusNames = List.of("COMPLETED", "DONE", "CONCLUÍDO");

        List<Task> userTasks = taskRepository.findByAssignedTo(currentUser);

        dashboardStats.setTotalTasks(userTasks.size());
        dashboardStats.setToDoToday(taskRepository.countTasksDueToday(currentUser, startOfDay, endOfDay, completedStatusNames));
        dashboardStats.setOverdue(taskRepository.countOverdueTasks(currentUser, LocalDateTime.now(), completedStatusNames));

        // Contar tarefas "Em Progresso" pelo nome
        Integer inProgressCount = taskRepository.countByUserAndStatusName(currentUser, "In Progress");
        if (inProgressCount == null) {
            inProgressCount = taskRepository.countByUserAndStatusName(currentUser, "EM PROGRESSO");
        }
        dashboardStats.setInProgress(inProgressCount != null ? inProgressCount : 0);

        int totalEstimated = userTasks.stream().mapToInt(task -> task.getEstimatedHours() != null ? task.getEstimatedHours() : 0).sum();
        int totalActual = userTasks.stream().mapToInt(task -> task.getActualHours() != null ? task.getActualHours() : 0).sum();

        int completedEstimated = userTasks.stream()
                .filter(task -> task.getStatus() != null && completedStatusNames.contains(task.getStatus().getName().toUpperCase()))
                .mapToInt(task -> task.getEstimatedHours() != null ? task.getEstimatedHours() : 0)
                .sum();

        dashboardStats.setTotalEstimatedHours(totalEstimated);
        dashboardStats.setTotalActualHours(totalActual);
        dashboardStats.setCompletedTasksEstimatedHours(completedEstimated);

        if (totalEstimated > 0) {
            dashboardStats.setEstimatedVsActualRatio((double) totalActual / totalEstimated);
        } else {
            dashboardStats.setEstimatedVsActualRatio(0.0);
        }

        return dashboardStats;
    }

    public List<TaskSummaryDTO> getAllTasksByStatus(Long statusId, Long workspaceId, Integer year, Integer month) {
        User currentUser = getCurrentUser();

        LocalDateTime startDate;
        LocalDateTime endDate;

        if (year != null && month != null) {
            startDate = LocalDateTime.of(year, month, 1, 0, 0);
            endDate = startDate.plusMonths(1).minusNanos(1);
        } else {
            List<Task> tasks;
            if (workspaceId != null) {
                // If workspace is specified, get all tasks in that workspace with the given status
                Workspace workspace = workspaceRepository.findById(workspaceId).orElse(null);
                if (workspace == null) {
                    return List.of(); // Return empty list if workspace not found
                }
                
                // Verify user has access to this workspace
                if (!canUserAccessWorkspace(workspace, currentUser)) {
                    throw new IllegalArgumentException("You don't have access to this workspace");
                }
                
                tasks = taskRepository.findByWorkspaceWithFilters(workspace, statusId, null);
            } else {
                // If no workspace specified, get only user's assigned tasks with the given status
                tasks = taskRepository.findByStatusWorkspaceAndAssignedTo(statusId, currentUser, null);
            }
            return tasks.stream().map(this::convertToTaskSummaryDto).collect(Collectors.toList());
        }

        List<Task> tasks = taskRepository.findByStatusAndDueDateBetween(statusId, workspaceId, startDate, endDate);

        return tasks.stream()
                .filter(task -> task.canView(currentUser)) // Garante a permissão de visualização
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

    public TaskStatusDTO convertToTaskStatusDto(TaskStatus status) {
        TaskStatusDTO taskStatusDTO = new TaskStatusDTO();
        taskStatusDTO.setColor(status.getColor());
        taskStatusDTO.setName(status.getName());
        taskStatusDTO.setId(status.getId());
        return taskStatusDTO;
    }

    public TaskSummaryDTO convertToTaskSummaryDto(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(convertToTaskStatusDto(task.getStatus()));
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
        if (task.getWorkspace() != null) {
            dto.setWorkspace(new WorkspaceNameDTO(task.getWorkspace().getId(), task.getWorkspace().getName()));
        }

        return dto;
    }

    private TaskDetailDTO convertToTaskDetailDto(Task task) {
        TaskDetailDTO dto = new TaskDetailDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setNotes(task.getNotes());
        dto.setStatus(convertToTaskStatusDto(task.getStatus()));
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
                    && task.getStatus().getName().equalsIgnoreCase("COMPLETED"));
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
        dto.setStatus(convertToTaskStatusDto(task.getStatus()));
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
                    && task.getStatus().getName().equalsIgnoreCase("COMPLETED"));
            dto.setDaysUntilDue((int) ChronoUnit.DAYS.between(LocalDateTime.now(), task.getDueDate()));
        } else {
            dto.setIsOverdue(false);
        }

        dto.setCommentsCount(task.getComments() != null ? task.getComments().size() : 0);
        dto.setNotes(task.getNotes());

        // Convert attachments
        if (task.getAttachments() != null && !task.getAttachments().isEmpty()) {
            List<AttachmentResponseDTO> attachmentDtos = task.getAttachments().stream()
                    .filter(attachment -> attachment.getIsLatestVersion())
                    .map(this::convertToAttachmentResponseDto)
                    .collect(Collectors.toList());
            dto.setAttachments(attachmentDtos);
        }

        // Add checklist items
        if (task.getChecklist() != null && !task.getChecklist().isEmpty()) {
            dto.setChecklist(task.getChecklist());
        }

        return dto;
    }

    // Workspace-wide task methods for collaborative view
    public PageResponse<TaskSummaryDTO> getAllTasksInWorkspace(Long workspaceId, Pageable pageable) {
        return getAllTasksInWorkspace(workspaceId, null, null, pageable);
    }

    public PageResponse<TaskSummaryDTO> getAllTasksInWorkspace(Long workspaceId, Long statusId,
                                                              PriorityEnum priority, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
                
        // Verify user has access to this workspace
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        Page<Task> taskPage;
        if (statusId != null || priority != null) {
            taskPage = taskRepository.findByWorkspaceWithFiltersPageable(workspace, statusId, priority, pageable);
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

    public List<TaskSummaryDTO> getAllTasksInWorkspaceList(Long workspaceId, Long statusId, PriorityEnum priority) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
                
        // Verify user has access to this workspace
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        List<Task> tasks;
        if (statusId != null || priority != null) {
            tasks = taskRepository.findByWorkspaceWithFilters(workspace, statusId, priority);
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

    public List<TaskResponseDTO> bulkUpdateTasks(BulkTaskOperationDTO bulkUpdateDTO) {
        User currentUser = getCurrentUser();

        List<Task> tasks = taskRepository.findAllById(bulkUpdateDTO.getTaskIds());

        if (tasks.size() != bulkUpdateDTO.getTaskIds().size()) {
            throw new IllegalArgumentException("Some tasks were not found");
        }

        // Validar permissões e consistência do workspace
        if (!tasks.isEmpty()) {
            Long firstWorkspaceId = tasks.get(0).getWorkspace().getId();
            for (Task task : tasks) {
                if (!task.canEdit(currentUser)) {
                    throw new IllegalArgumentException("You don't have permission to edit task: " + task.getTitle());
                }
                if (!task.getWorkspace().getId().equals(firstWorkspaceId)) {
                    throw new IllegalArgumentException("Bulk operations can only be performed on tasks within the same workspace.");
                }
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
        }

        TaskStatus newStatus = null;
        if (bulkUpdateDTO.getStatusId() != null) {
            newStatus = taskStatusRepository.findById(bulkUpdateDTO.getStatusId())
                    .orElseThrow(() -> new IllegalArgumentException("Status not found with id: " + bulkUpdateDTO.getStatusId()));

            // Valida se o status pertence ao workspace das tarefas
            if (!tasks.isEmpty() && !newStatus.getWorkspace().getId().equals(tasks.get(0).getWorkspace().getId())) {
                throw new IllegalArgumentException("The selected status does not belong to the tasks' workspace.");
            }
        }

        // Aplicar as atualizações em todas as tarefas
        for (Task task : tasks) {
            if (newStatus != null) {
                task.setStatus(newStatus);
                if ("Completed".equalsIgnoreCase(newStatus.getName())) {
                    task.setCompletedAt(java.time.OffsetDateTime.now());
                }
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

        // Enviar notificações via WebSocket para cada tarefa atualizada
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
      TaskStatus initialStatus = originalTask.getWorkspace().getTaskStatuses().stream()
                .min((s1, s2) -> Integer.compare(s1.getOrder(), s2.getOrder()))
                .orElseThrow(() -> new IllegalStateException("Cannot clone task: The workspace does not have any statuses configured."));

        // Create clone with "Copy of" prefix
        Task clonedTask = Task.builder()
                .title("Copy of " + originalTask.getTitle())
                .description(originalTask.getDescription())
                .status(initialStatus) // <-- MUDANÇA APLICADA AQUI
                .priority(originalTask.getPriority())
                .assignedTo(currentUser) // Assign to current user
                .workspace(originalTask.getWorkspace())
                .categories(new ArrayList<>(originalTask.getCategories()))
                .estimatedHours(originalTask.getEstimatedHours())
                .build();

        clonedTask = taskRepository.save(clonedTask);
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
        TaskStatus initialStatus = parentTask.getWorkspace().getTaskStatuses().stream()
                .min((s1, s2) -> Integer.compare(s1.getOrder(), s2.getOrder()))
                .orElseThrow(() -> new IllegalStateException("Cannot create subtask: The workspace does not have any statuses configured."));

        Task subtask = Task.builder()
                .title(createSubtaskDTO.getTitle())
                .description(createSubtaskDTO.getDescription())
                .status(initialStatus) // <-- MUDANÇA APLICADA AQUI
                .priority(createSubtaskDTO.getPriority())
                .dueDate(createSubtaskDTO.getDueDate())
                .assignedTo(assignedUser)
                .workspace(parentTask.getWorkspace())
                .parentTask(parentTask)
                .categories(categories)
                .estimatedHours(createSubtaskDTO.getEstimatedHours())
                .build();
        subtask = taskRepository.save(subtask);

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

    // Advanced Search
    public PageResponse<TaskSummaryDTO> advancedSearch(AdvancedSearchDTO searchDTO, Pageable pageable) {
        User currentUser = getCurrentUser();
        
        StringBuilder queryBuilder = new StringBuilder("SELECT DISTINCT t FROM Task t ");
        StringBuilder whereBuilder = new StringBuilder("WHERE 1=1 ");
        List<Object> parameters = new ArrayList<>();
        int paramIndex = 1;

        // Join with workspace for access control
        queryBuilder.append("JOIN t.workspace w ");
        queryBuilder.append("LEFT JOIN w.workspaceMembers wm ");
        whereBuilder.append("AND (w.owner = ?").append(paramIndex).append(" OR wm.user = ?").append(paramIndex + 1).append(") ");
        parameters.add(currentUser);
        parameters.add(currentUser);
        paramIndex += 2;

        // Search term in title and description
        if (searchDTO.getSearchTerm() != null && !searchDTO.getSearchTerm().trim().isEmpty()) {
            whereBuilder.append("AND (LOWER(t.title) LIKE LOWER(?").append(paramIndex).append(") OR LOWER(t.description) LIKE LOWER(?").append(paramIndex + 1).append(")) ");
            String searchTerm = "%" + searchDTO.getSearchTerm().trim() + "%";
            parameters.add(searchTerm);
            parameters.add(searchTerm);
            paramIndex += 2;
        }

        // Workspace filter
        if (searchDTO.getWorkspaceIds() != null && !searchDTO.getWorkspaceIds().isEmpty()) {
            whereBuilder.append("AND t.workspace.id IN (");
            for (int i = 0; i < searchDTO.getWorkspaceIds().size(); i++) {
                if (i > 0) whereBuilder.append(", ");
                whereBuilder.append("?").append(paramIndex);
                parameters.add(searchDTO.getWorkspaceIds().get(i));
                paramIndex++;
            }
            whereBuilder.append(") ");
        }

        // Status filter
        if (searchDTO.getStatusesId() != null && !searchDTO.getStatusesId().isEmpty()) {
            whereBuilder.append("AND t.status IN (");
            for (int i = 0; i < searchDTO.getStatusesId().size(); i++) {
                if (i > 0) whereBuilder.append(", ");
                whereBuilder.append("?").append(paramIndex);
                parameters.add(searchDTO.getStatusesId().get(i));
                paramIndex++;
            }
            whereBuilder.append(") ");
        }

        // Priority filter
        if (searchDTO.getPriorities() != null && !searchDTO.getPriorities().isEmpty()) {
            whereBuilder.append("AND t.priority IN (");
            for (int i = 0; i < searchDTO.getPriorities().size(); i++) {
                if (i > 0) whereBuilder.append(", ");
                whereBuilder.append("?").append(paramIndex);
                parameters.add(searchDTO.getPriorities().get(i));
                paramIndex++;
            }
            whereBuilder.append(") ");
        }

        // Category filter
        if (searchDTO.getCategoryIds() != null && !searchDTO.getCategoryIds().isEmpty()) {
            queryBuilder.append("LEFT JOIN t.categories c ");
            whereBuilder.append("AND c.id IN (");
            for (int i = 0; i < searchDTO.getCategoryIds().size(); i++) {
                if (i > 0) whereBuilder.append(", ");
                whereBuilder.append("?").append(paramIndex);
                parameters.add(searchDTO.getCategoryIds().get(i));
                paramIndex++;
            }
            whereBuilder.append(") ");
        }

        // Date filters
        if (searchDTO.getDueDateFrom() != null) {
            whereBuilder.append("AND t.dueDate >= ?").append(paramIndex).append(" ");
            parameters.add(searchDTO.getDueDateFrom());
            paramIndex++;
        }

        if (searchDTO.getDueDateTo() != null) {
            whereBuilder.append("AND t.dueDate <= ?").append(paramIndex).append(" ");
            parameters.add(searchDTO.getDueDateTo());
            paramIndex++;
        }

        if (searchDTO.getCreatedDateFrom() != null) {
            whereBuilder.append("AND t.createdAt >= ?").append(paramIndex).append(" ");
            parameters.add(searchDTO.getCreatedDateFrom());
            paramIndex++;
        }

        if (searchDTO.getCreatedDateTo() != null) {
            whereBuilder.append("AND t.createdAt <= ?").append(paramIndex).append(" ");
            parameters.add(searchDTO.getCreatedDateTo());
            paramIndex++;
        }

        // Additional filters
        if (searchDTO.getHasAttachments() != null && searchDTO.getHasAttachments()) {
            queryBuilder.append("LEFT JOIN t.attachments att ");
            whereBuilder.append("AND att.id IS NOT NULL ");
        }

        if (searchDTO.getHasSubtasks() != null && searchDTO.getHasSubtasks()) {
            queryBuilder.append("LEFT JOIN t.subtasks st ");
            whereBuilder.append("AND st.id IS NOT NULL ");
        }

        if (searchDTO.getIsOverdue() != null && searchDTO.getIsOverdue()) {
            whereBuilder.append("AND t.dueDate < ?").append(paramIndex).append(" ");
            whereBuilder.append("AND t.status != 'COMPLETED' ");
            parameters.add(LocalDateTime.now());
            paramIndex++;
        }

        // Build final query
        String finalQuery = queryBuilder.toString() + whereBuilder.toString() + "ORDER BY t.createdAt DESC";

        jakarta.persistence.Query query = entityManager.createQuery(finalQuery);
        
        // Set parameters
        for (int i = 0; i < parameters.size(); i++) {
            query.setParameter(i + 1, parameters.get(i));
        }

        // Apply pagination
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<Task> tasks = query.getResultList();

        // Count query for total elements
        String countQuery = queryBuilder.toString().replace("SELECT DISTINCT t", "SELECT COUNT(DISTINCT t)") + whereBuilder.toString();
        jakarta.persistence.Query countQ = entityManager.createQuery(countQuery);
        for (int i = 0; i < parameters.size(); i++) {
            countQ.setParameter(i + 1, parameters.get(i));
        }
        Long totalElements = (Long) countQ.getSingleResult();

        // Convert to DTOs
        List<TaskSummaryDTO> taskSummaryDTOs = tasks.stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());
        return new PageResponse<TaskSummaryDTO>(
                taskSummaryDTOs,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                totalElements,
                totalPages,
                pageable.getPageNumber() == 0,
                pageable.getPageNumber() >= (totalPages - 1),
                taskSummaryDTOs.isEmpty()
        );
    }

    // Calendar View
    public List<TaskSummaryDTO> getTasksForDateRange(String startDate, String endDate, Long workspaceId, Long statusId) {
        User currentUser = getCurrentUser();
        
        LocalDateTime startDateTime = LocalDateTime.parse(startDate + "T00:00:00");
        LocalDateTime endDateTime = LocalDateTime.parse(endDate + "T23:59:59");
        
        StringBuilder queryBuilder = new StringBuilder("SELECT DISTINCT t FROM Task t ");
        StringBuilder whereBuilder = new StringBuilder("WHERE 1=1 ");
        List<Object> parameters = new ArrayList<>();
        int paramIndex = 1;

        // Access control
        queryBuilder.append("JOIN t.workspace w ");
        queryBuilder.append("LEFT JOIN w.workspaceMembers wm ");
        whereBuilder.append("AND (w.owner = ?").append(paramIndex).append(" OR wm.user = ?").append(paramIndex + 1).append(") ");
        parameters.add(currentUser);
        parameters.add(currentUser);
        paramIndex += 2;

        // Date range filter - tasks with due dates in the range OR created in the range
        whereBuilder.append("AND ((t.dueDate BETWEEN ?").append(paramIndex).append(" AND ?").append(paramIndex + 1).append(") ");
        whereBuilder.append("OR (t.createdAt BETWEEN ?").append(paramIndex + 2).append(" AND ?").append(paramIndex + 3).append(")) ");
        parameters.add(startDateTime);
        parameters.add(endDateTime);
        parameters.add(startDateTime);
        parameters.add(endDateTime);
        paramIndex += 4;

        // Workspace filter
        if (workspaceId != null) {
            whereBuilder.append("AND t.workspace.id = ?").append(paramIndex).append(" ");
            parameters.add(workspaceId);
            paramIndex++;
        }

        // Status filter
        if (statusId != null) {
            whereBuilder.append("AND t.status = ?").append(paramIndex).append(" ");
            parameters.add(statusId);
            paramIndex++;
        }

        String finalQuery = queryBuilder.toString() + whereBuilder.toString() + "ORDER BY t.dueDate ASC, t.createdAt DESC";

        jakarta.persistence.Query query = entityManager.createQuery(finalQuery);
        
        for (int i = 0; i < parameters.size(); i++) {
            query.setParameter(i + 1, parameters.get(i));
        }

        @SuppressWarnings("unchecked")
        List<Task> tasks = query.getResultList();

        return tasks.stream()
                .map(this::convertToTaskSummaryDto)
                .collect(Collectors.toList());
    }
    
    // endregion
}