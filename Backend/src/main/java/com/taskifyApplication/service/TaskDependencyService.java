package com.taskifyApplication.service;

import com.taskifyApplication.dto.TaskDependencyDto.*;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import com.taskifyApplication.service.TaskService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskDependencyService {

    @Autowired
    private TaskDependencyRepository taskDependencyRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskService taskService;

    public TaskDependencyResponseDTO createTaskDependency(CreateTaskDependencyDTO createDTO) {
        User currentUser = getCurrentUser();
        
        Task task = taskRepository.findById(createDTO.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        Task dependsOnTask = taskRepository.findById(createDTO.getDependsOnTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Dependency task not found"));
        
        // Verify access permissions
        if (!task.canEdit(currentUser) || !dependsOnTask.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to create this dependency");
        }
        
        // Prevent self-dependency
        if (task.getId().equals(dependsOnTask.getId())) {
            throw new IllegalArgumentException("A task cannot depend on itself");
        }
        
        // Check for existing dependency
        if (taskDependencyRepository.findByTaskAndDependsOnTask(task, dependsOnTask).isPresent()) {
            throw new IllegalArgumentException("This dependency already exists");
        }
        
        // Check for circular dependencies
        if (wouldCreateCircularDependency(task, dependsOnTask)) {
            throw new IllegalArgumentException("This dependency would create a circular dependency");
        }
        
        TaskDependency dependency = TaskDependency.builder()
                .task(task)
                .dependsOnTask(dependsOnTask)
                .type(createDTO.getType())
                .build();
        
        dependency = taskDependencyRepository.save(dependency);
        
        return convertToTaskDependencyResponseDto(dependency);
    }
    
    public List<TaskDependencyResponseDTO> getTaskDependencies(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have access to this task");
        }
        
        List<TaskDependency> dependencies = taskDependencyRepository.findByTask(task);
        
        return dependencies.stream()
                .map(this::convertToTaskDependencyResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDependencyResponseDTO> getTasksDependingOn(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have access to this task");
        }
        
        List<TaskDependency> dependentTasks = taskDependencyRepository.findByDependsOnTask(task);
        
        return dependentTasks.stream()
                .map(this::convertToTaskDependencyResponseDto)
                .collect(Collectors.toList());
    }
    
    public void removeTaskDependency(Long dependencyId) {
        User currentUser = getCurrentUser();
        
        TaskDependency dependency = taskDependencyRepository.findById(dependencyId)
                .orElseThrow(() -> new IllegalArgumentException("Dependency not found"));
        
        if (!dependency.getTask().canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to remove this dependency");
        }
        
        taskDependencyRepository.delete(dependency);
    }
    
    public boolean canStartTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        List<Task> dependencies = taskDependencyRepository.findDependenciesForTask(task);
        
        // Check if all dependencies are completed
        return dependencies.stream()
                .allMatch(dep -> dep.getStatus() == StatusTaskEnum.COMPLETED);
    }
    
    public List<Task> getBlockingTasks(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        List<Task> dependencies = taskDependencyRepository.findDependenciesForTask(task);
        
        return dependencies.stream()
                .filter(dep -> dep.getStatus() != StatusTaskEnum.COMPLETED)
                .collect(Collectors.toList());
    }
    
    private boolean wouldCreateCircularDependency(Task task, Task dependsOnTask) {
        // Simple check for direct circular dependency
        if (taskDependencyRepository.hasCircularDependency(task, dependsOnTask)) {
            return true;
        }
        
        // More complex check for indirect circular dependencies
        return hasIndirectCircularDependency(task, dependsOnTask);
    }
    
    private boolean hasIndirectCircularDependency(Task task, Task dependsOnTask) {
        List<Task> dependencies = taskDependencyRepository.findDependenciesForTask(dependsOnTask);
        
        for (Task dep : dependencies) {
            if (dep.getId().equals(task.getId())) {
                return true;
            }
            if (hasIndirectCircularDependency(task, dep)) {
                return true;
            }
        }
        
        return false;
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    private TaskDependencyResponseDTO convertToTaskDependencyResponseDto(TaskDependency dependency) {
        TaskDependencyResponseDTO dto = new TaskDependencyResponseDTO();
        dto.setId(dependency.getId());
        dto.setTask(taskService.convertToTaskSummaryDto(dependency.getTask()));
        dto.setDependsOnTask(taskService.convertToTaskSummaryDto(dependency.getDependsOnTask()));
        dto.setType(dependency.getType());
        dto.setCreatedAt(dependency.getCreatedAt());
        
        // Determine dependency status
        StatusTaskEnum dependsOnStatus = dependency.getDependsOnTask().getStatus();
        if (dependsOnStatus == StatusTaskEnum.COMPLETED) {
            dto.setDependencyStatus("SATISFIED");
            dto.setIsBlocking(false);
        } else {
            dto.setDependencyStatus("PENDING");
            dto.setIsBlocking(true);
        }
        
        return dto;
    }
}