package com.taskifyApplication.service;

import com.taskifyApplication.dto.TaskDto.CreateTaskDTO;
import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.TaskTemplateDto.*;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskTemplateService {

    @Autowired
    private TaskTemplateRepository taskTemplateRepository;
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskService taskService;

    public TaskTemplateResponseDTO createTemplate(CreateTaskTemplateDTO createDTO) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(createDTO.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        List<Category> categories = new ArrayList<>();
        if (createDTO.getCategoryIds() != null && !createDTO.getCategoryIds().isEmpty()) {
            categories = categoryRepository.findAllById(createDTO.getCategoryIds());
        }
        
        TaskTemplate template = TaskTemplate.builder()
                .name(createDTO.getName())
                .description(createDTO.getDescription())
                .workspace(workspace)
                .defaultTitle(createDTO.getDefaultTitle())
                .defaultDescription(createDTO.getDefaultDescription())
                .defaultPriority(createDTO.getDefaultPriority())
                .defaultEstimatedHours(createDTO.getDefaultEstimatedHours())
                .defaultTags(createDTO.getDefaultTags() != null ? createDTO.getDefaultTags() : new ArrayList<>())
                .categories(categories)
                .createdBy(currentUser)
                .build();
        
        template = taskTemplateRepository.save(template);
        
        // Create default checklist items if provided
        if (createDTO.getDefaultChecklistItems() != null) {
            for (int i = 0; i < createDTO.getDefaultChecklistItems().size(); i++) {
                TemplateChecklistItem checklistItem = TemplateChecklistItem.builder()
                        .template(template)
                        .text(createDTO.getDefaultChecklistItems().get(i))
                        .orderIndex(i)
                        .build();
                template.getDefaultChecklist().add(checklistItem);
            }
            template = taskTemplateRepository.save(template);
        }
        
        return convertToTaskTemplateResponseDto(template);
    }
    
    public List<TaskTemplateResponseDTO> getWorkspaceTemplates(Long workspaceId) {
        User currentUser = getCurrentUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        List<TaskTemplate> templates = taskTemplateRepository.findByWorkspaceOrderByNameAsc(workspace);
        
        return templates.stream()
                .map(this::convertToTaskTemplateResponseDto)
                .collect(Collectors.toList());
    }
    
    public TaskResponseDTO createTaskFromTemplate(Long templateId, Long workspaceId) {
        User currentUser = getCurrentUser();
        
        TaskTemplate template = taskTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        // Create task DTO from template
        CreateTaskDTO createTaskDTO = new CreateTaskDTO();
        createTaskDTO.setTitle(template.getDefaultTitle());
        createTaskDTO.setDescription(template.getDefaultDescription());
        createTaskDTO.setPriority(template.getDefaultPriority());
        createTaskDTO.setWorkspaceId(workspaceId);
        
        if (!template.getCategories().isEmpty()) {
            createTaskDTO.setCategoryIds(template.getCategories().stream()
                    .map(Category::getId)
                    .collect(Collectors.toList()));
        }
        
        TaskResponseDTO createdTask = taskService.createTask(createTaskDTO);
        
        // TODO: Add checklist items to the created task
        
        return createdTask;
    }
    
    public void deleteTemplate(Long templateId) {
        User currentUser = getCurrentUser();
        
        TaskTemplate template = taskTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        
        if (!template.getCreatedBy().equals(currentUser) && 
            !canUserAccessWorkspace(template.getWorkspace(), currentUser)) {
            throw new IllegalArgumentException("You don't have permission to delete this template");
        }
        
        taskTemplateRepository.delete(template);
    }
    
    private boolean canUserAccessWorkspace(Workspace workspace, User user) {
        if (workspace.getOwner().equals(user)) {
            return true;
        }
        return workspace.getMembers().stream()
                .anyMatch(member -> member.getUser().equals(user));
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    private TaskTemplateResponseDTO convertToTaskTemplateResponseDto(TaskTemplate template) {
        TaskTemplateResponseDTO dto = new TaskTemplateResponseDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setDefaultTitle(template.getDefaultTitle());
        dto.setDefaultDescription(template.getDefaultDescription());
        dto.setDefaultPriority(template.getDefaultPriority());
        dto.setDefaultEstimatedHours(template.getDefaultEstimatedHours());
        dto.setDefaultTags(template.getDefaultTags());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        dto.setCreatedByName(template.getCreatedBy().getFirstName() + " " + template.getCreatedBy().getLastName());
        dto.setWorkspaceName(template.getWorkspace().getName());
        
        if (!template.getCategories().isEmpty()) {
            dto.setCategoryNames(template.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toList()));
        }
        
        if (!template.getDefaultChecklist().isEmpty()) {
            dto.setChecklistItems(template.getDefaultChecklist().stream()
                    .map(TemplateChecklistItem::getText)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}