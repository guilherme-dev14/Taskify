package com.taskifyApplication.service;

import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CreateCategoryDTO;
import com.taskifyApplication.dto.CategoryDto.UpdateCategoryDTO;
import com.taskifyApplication.model.Category;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.CategoryRepository;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    // region REPOSITORIES
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private WorkspaceRepository workspaceRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private ValidationService validationService;
    // endregion

    // region CRUD
    public CategoryResponseDTO getCategoryById(Long categoryId) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        
        // Check if user has access to the workspace containing this category
        if (!workspaceRepository.accessibleForUser(currentUser, category.getWorkspace().getId())) {
            throw new IllegalArgumentException("You don't have access to this category");
        }

        return convertToCategoryResponseDTO(category);
    }

    public CategoryResponseDTO createCategory(CreateCategoryDTO createCategoryDTO) {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(createCategoryDTO.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        
        // Check if user has access to the workspace
        if (!workspaceRepository.accessibleForUser(currentUser, workspace.getId())) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }
        
        // Check if category name already exists in workspace
        if (categoryRepository.existsInWorkspace(workspace.getId(), createCategoryDTO.getName())) {
            throw new IllegalArgumentException("Category with this name already exists in the workspace");
        }

        Category category = Category.builder()
                .name(validationService.sanitizeString(createCategoryDTO.getName()))
                .description(validationService.sanitizeHtml(createCategoryDTO.getDescription()))
                .workspace(workspace)
                .build();

        category = categoryRepository.save(category);
        return convertToCategoryResponseDTO(category);
    }

    public void deleteCategory(Long categoryId) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        
        // Check if user has access to the workspace
        if (!workspaceRepository.accessibleForUser(currentUser, category.getWorkspace().getId())) {
            throw new IllegalArgumentException("You don't have access to this category");
        }
        
        categoryRepository.delete(category);
    }

    public List<CategoryResponseDTO> getAllCategoriesFromWorkspace(Long workspaceId) {
        User currentUser = getCurrentUser();
        
        // Check if user has access to the workspace
        if (!workspaceRepository.accessibleForUser(currentUser, workspaceId)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        List<Category> categories = categoryRepository.getAllCategoriesFromWorkspace(workspaceId);

        return categories.stream()
                .map(this::convertToCategoryResponseDTO)
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO updateCategory(UpdateCategoryDTO updateCategoryDTO) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(updateCategoryDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + updateCategoryDTO.getId()));
        
        // Check if user has access to the workspace
        if (!workspaceRepository.accessibleForUser(currentUser, category.getWorkspace().getId())) {
            throw new IllegalArgumentException("You don't have access to this category");
        }

        if (updateCategoryDTO.getName() != null && !updateCategoryDTO.getName().trim().isEmpty()) {
            // Check if new name already exists in workspace (excluding current category)
            if (!category.getName().equals(updateCategoryDTO.getName()) &&
                    categoryRepository.existsInWorkspace(category.getWorkspace().getId(), updateCategoryDTO.getName())) {
                throw new IllegalArgumentException("Category with this name already exists in the workspace");
            }
            category.setName(validationService.sanitizeString(updateCategoryDTO.getName().trim()));
        }

        if (updateCategoryDTO.getDescription() != null) {
            category.setDescription(validationService.sanitizeHtml(updateCategoryDTO.getDescription().trim()));
        }
        
        category = categoryRepository.save(category);
        return convertToCategoryResponseDTO(category);
    }

    // endregion

    // region PRIVATE FUNCTIONS
    private CategoryResponseDTO convertToCategoryResponseDTO(Category category) {
        CategoryResponseDTO categoryResponseDTO = new CategoryResponseDTO();

        categoryResponseDTO.setId(category.getId());
        categoryResponseDTO.setName(category.getName());
        categoryResponseDTO.setDescription(category.getDescription());
        categoryResponseDTO.setTaskCount(taskRepository.countByCategoryId(category.getId()));
        return categoryResponseDTO;
    }


    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // endregion
}
