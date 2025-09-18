package com.taskifyApplication.controller;

import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CreateCategoryDTO;
import com.taskifyApplication.dto.CategoryDto.UpdateCategoryDTO;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.service.CategoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategoriesFromWorkspace(@PathVariable Long workspaceId) {
            List<CategoryResponseDTO> categories = categoryService.getAllCategoriesFromWorkspace(workspaceId);
            return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
            CategoryResponseDTO category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CreateCategoryDTO createCategoryDTO) {
            CategoryResponseDTO category = categoryService.createCategory(createCategoryDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<CategoryResponseDTO> updateCategory(@Valid @RequestBody UpdateCategoryDTO updateCategoryDTO) {
            CategoryResponseDTO category = categoryService.updateCategory(updateCategoryDTO);
            return ResponseEntity.ok(category);
    }

}
