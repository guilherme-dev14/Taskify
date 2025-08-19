package com.taskifyApplication.service;

import com.taskifyApplication.model.Category;
import com.taskifyApplication.repository.CategoryRepository;

public class CategoryService {

    CategoryRepository categoryRepository;
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
}
