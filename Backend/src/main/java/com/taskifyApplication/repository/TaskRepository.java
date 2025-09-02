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
    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace AND t.assignedTo = :user " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    List<Task> findByWorkspaceAndAssignedTo(@Param("workspace") Workspace workspace, 
                                           @Param("user") User currentUser,
                                           @Param("status") StatusTaskEnum status,
                                           @Param("priority") PriorityEnum priority);

    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace AND t.assignedTo = :user " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByWorkspaceAndAssignedToPageable(@Param("workspace") Workspace workspace, 
                                                   @Param("user") User currentUser,
                                                   @Param("status") StatusTaskEnum status,
                                                   @Param("priority") PriorityEnum priority,
                                                   Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByAssignedTo(@Param("user") User assignedTo, 
                               @Param("status") StatusTaskEnum status,
                               @Param("priority") PriorityEnum priority,
                               Pageable pageable);


    List<Task> findByAssignedTo(User assignedTo);

    Page<Task> findByAssignedTo(User assignedTo, Pageable pageable);
    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user " + 
           "AND (t.status = :status) " + 
           "AND (:workspace IS NULL OR t.workspace = :workspace)")
    List<Task> findByStatusWorkspaceAndAssignedTo(@Param("status") StatusTaskEnum status, 
                                                 @Param("user") User currentUser, 
                                                 @Param("workspace") Workspace workspace);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user")
    List<Task> findByWorkspaceAndStatus(@Param("workspace") Workspace workspace, @Param("status") StatusTaskEnum status, @Param("user")  User currentUser);


    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.workspace.id = :workspaceId")
    Page<Task> findByAssignedToAndWorkspaceId(@Param("user") User assignedTo, @Param("workspaceId") Long workspaceId, Pageable pageable);


    boolean existsByTitleAndWorkspace(String title, Workspace workspace);


    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :start AND :end")
    List<Task> findTasksDueBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.categories c WHERE c.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT t FROM Task t JOIN FETCH t.categories WHERE t.workspace = :workspace")
    List<Task> findByWorkspaceWithCategories(@Param("workspace") Workspace workspace);

    @Query("SELECT t FROM Task t JOIN t.categories c WHERE c.id = :categoryId")
    List<Task> findByCategory(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user AND t.dueDate >= :startOfDay AND t.dueDate < :endOfDay AND t.status != :completedStatus")
    Integer countTasksDueToday(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay, @Param("completedStatus") StatusTaskEnum completedStatus);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    Integer countByStatus(@Param("status") StatusTaskEnum status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user AND t.dueDate < :currentDateTime AND t.status != :completedStatus")
    Integer countOverdueTasks(@Param("user") User user, @Param("currentDateTime") LocalDateTime currentDateTime, @Param("completedStatus") StatusTaskEnum completedStatus);
    
    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user " +
           "AND (:workspaceId IS NULL OR t.workspace.id = :workspaceId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findTasksWithFilters(@Param("user") User assignedTo, 
                                   @Param("workspaceId") Long workspaceId,
                                   @Param("status") StatusTaskEnum status,
                                   @Param("priority") PriorityEnum priority,
                                   Pageable pageable);
}