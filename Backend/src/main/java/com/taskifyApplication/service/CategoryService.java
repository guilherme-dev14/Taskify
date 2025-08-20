package com.taskifyApplication.service;

import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CreateCategoryDTO;
import com.taskifyApplication.dto.CategoryDto.UpdateCategoryDTO;
import com.taskifyApplication.model.Category;
import com.taskifyApplication.model.Task;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

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
    // endregion


    // region PUBLIC FUNCTIONS
    public CategoryResponseDTO getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + categoryId));

        return convertToCategoryResponseDTO(category);
    }

    public CategoryResponseDTO createCategory(CreateCategoryDTO createCategoryDTO) {
        Workspace workspace = workspaceRepository.findById(createCategoryDTO.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        Category category = Category.builder()
                .name(createCategoryDTO.getName())
                .description(createCategoryDTO.getDescription())
                .workspace(workspace)
                .build();

        category =  categoryRepository.save(category);
        return convertToCategoryResponseDTO(category);

    }

    public void deleteCategory( Long CategoryId) {
        Category category = categoryRepository.findById((CategoryId))
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + CategoryId));
        categoryRepository.deleteById(CategoryId);
    }

    public List<CategoryResponseDTO> getAllCategoriesFromWorkspace(Long workspaceId) {

        List<Category> category = categoryRepository.getAllCategoriesFromWorkspace(workspaceId);

        return category.stream()
                .map(this::convertToCategoryResponseDTO)
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO getCategoryByName(String categoryName) {
        Category category = categoryRepository.findByName(categoryName);
        return convertToCategoryResponseDTO(category);
    }

    public CategoryResponseDTO updateCategory(Long categoryId, UpdateCategoryDTO updateCategoryDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + categoryId));

        if (updateCategoryDTO.getName() != null) {
            if (!category.getName().equals(updateCategoryDTO.getName()) &&
                    categoryRepository.existsInWorkspace(category.getWorkspace().getId(), updateCategoryDTO.getName())) {
                throw new IllegalStateException("Task with this title already exists in the workspace!");
            }
            category.setName(updateCategoryDTO.getName());
        }

        if (updateCategoryDTO.getDescription() != null) {
            category.setDescription(updateCategoryDTO.getDescription());
        }
        category = categoryRepository.save(category);

        return convertToCategoryResponseDTO(category);
    }

    // endregion

    // region PRIVATE AUXILIARS FUNCTIONS
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
