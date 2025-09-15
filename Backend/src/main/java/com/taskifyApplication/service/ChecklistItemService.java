package com.taskifyApplication.service;

import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ChecklistItemService {

    @Autowired
    private ChecklistItemRepository checklistItemRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WebSocketService webSocketService;

    public ChecklistItem addChecklistItem(Long taskId, String text) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to modify this task");
        }
        
        int nextOrder = checklistItemRepository.getMaxOrderIndexForTask(task) + 1;
        
        ChecklistItem item = ChecklistItem.builder()
                .task(task)
                .text(text)
                .completed(false)
                .orderIndex(nextOrder)
                .build();
        
        item = checklistItemRepository.save(item);
        
        // Notify workspace members
        webSocketService.notifyWorkspaceActivity(
            task.getWorkspace().getId(),
            "Added checklist item to: " + task.getTitle(),
            currentUser
        );
        
        return item;
    }
    
    public ChecklistItem toggleChecklistItem(Long itemId) {
        User currentUser = getCurrentUser();
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found"));
        
        if (!item.getTask().canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to modify this task");
        }
        
        item.setCompleted(!item.getCompleted());
        item = checklistItemRepository.save(item);
        
        // Update task progress
        updateTaskProgress(item.getTask());
        
        // Notify workspace members
        String action = item.getCompleted() ? "completed" : "unchecked";
        webSocketService.notifyWorkspaceActivity(
            item.getTask().getWorkspace().getId(),
            "Checklist item " + action + " in: " + item.getTask().getTitle(),
            currentUser
        );
        
        return item;
    }
    
    public void deleteChecklistItem(Long itemId) {
        User currentUser = getCurrentUser();
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found"));
        
        if (!item.getTask().canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to modify this task");
        }
        
        Task task = item.getTask();
        checklistItemRepository.delete(item);
        
        // Update task progress
        updateTaskProgress(task);
    }
    
    public List<ChecklistItem> getTaskChecklistItems(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        User currentUser = getCurrentUser();
        if (!task.canEdit(currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view this task");
        }
        
        return checklistItemRepository.findByTaskOrderByOrderIndexAsc(task);
    }
    
    private void updateTaskProgress(Task task) {
        List<ChecklistItem> items = checklistItemRepository.findByTaskOrderByOrderIndexAsc(task);
        
        if (!items.isEmpty()) {
            long completedCount = items.stream().mapToLong(item -> item.getCompleted() ? 1 : 0).sum();
            int progress = (int) ((completedCount * 100) / items.size());
            task.setProgress(progress);
            taskRepository.save(task);
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}