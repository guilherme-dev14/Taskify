package com.taskifyApplication.repository;

import com.taskifyApplication.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkspace(Workspace workspace);

    List<Task> findByStatus(StatusTaskEnum status);

    List<Task> findByWorkspaceAndStatus(Workspace workspace, StatusTaskEnum status);

    List<Task> findByAssignedTo(User assignedTo);
    
    Page<Task> findByAssignedTo(User assignedTo, Pageable pageable);

    boolean existsByTitleAndWorkspace(String title, Workspace workspace);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :start AND :end")
    List<Task> findTasksDueBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.category.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Long categoryId);

}