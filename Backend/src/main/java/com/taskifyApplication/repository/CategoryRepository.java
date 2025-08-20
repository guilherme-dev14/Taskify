package com.taskifyApplication.repository;


import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.model.Category;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> getAllCategoriesFromWorkspace(Long workspaceId);

    Boolean existsInWorkspace(Long workspaceId, String categoryName);

    Category findByName(String name);
}

