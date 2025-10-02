package com.taskifyApplication.repository;

import com.taskifyApplication.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.workspace.id = :workspaceId")
    List<Category> getAllCategoriesFromWorkspace(@Param("workspaceId") Long workspaceId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Category c WHERE c.workspace.id = :workspaceId AND c.name = :name")
    Boolean existsInWorkspace(@Param("workspaceId") Long workspaceId, @Param("name") String name);
}

