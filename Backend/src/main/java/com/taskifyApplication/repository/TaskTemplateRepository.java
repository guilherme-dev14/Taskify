package com.taskifyApplication.repository;

import com.taskifyApplication.model.TaskTemplate;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {

    List<TaskTemplate> findByWorkspaceOrderByNameAsc(Workspace workspace);
    
    Page<TaskTemplate> findByWorkspaceOrderByUpdatedAtDesc(Workspace workspace, Pageable pageable);
    
    List<TaskTemplate> findByCreatedByOrderByUpdatedAtDesc(User createdBy);
    
    @Query("SELECT tt FROM TaskTemplate tt WHERE tt.workspace = :workspace AND " +
           "LOWER(tt.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<TaskTemplate> searchByName(@Param("workspace") Workspace workspace, @Param("search") String search);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.template = :template")
    Long countTasksUsingTemplate(@Param("template") TaskTemplate template);
}