package com.taskifyApplication.repository;

import com.taskifyApplication.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
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

    // Workspace-wide task methods (for collaborative view)
    List<Task> findByWorkspace(Workspace workspace);
    
    Page<Task> findByWorkspace(Workspace workspace, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.status = :status " +
            "AND (:workspaceId IS NULL OR t.workspace.id = :workspaceId) " +
            "AND (t.dueDate BETWEEN :startDate AND :endDate)")
    List<Task> findByStatusAndDueDateBetween(@Param("status") StatusTaskEnum status,
                                             @Param("workspaceId") Long workspaceId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    List<Task> findByWorkspaceWithFilters(@Param("workspace") Workspace workspace,
                                         @Param("status") StatusTaskEnum status,
                                         @Param("priority") PriorityEnum priority);
                                         
    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByWorkspaceWithFiltersPageable(@Param("workspace") Workspace workspace,
                                                 @Param("status") StatusTaskEnum status,
                                                 @Param("priority") PriorityEnum priority,
                                                 Pageable pageable);
    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user " + 
           "AND (t.status = :status) " + 
           "AND (:workspace IS NULL OR t.workspace = :workspace)")
    List<Task> findByStatusWorkspaceAndAssignedTo(@Param("status") StatusTaskEnum status, 
                                                 @Param("user") User currentUser, 
                                                 @Param("workspace") Workspace workspace);


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

    // Advanced search and filtering methods
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.tags tag WHERE " +
           "(:workspaceId IS NULL OR t.workspace.id = :workspaceId) " +
           "AND (:assigneeId IS NULL OR t.assignedTo.id = :assigneeId) " +
           "AND (:parentTaskId IS NULL OR t.parentTask.id = :parentTaskId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:estimatedHoursMin IS NULL OR t.estimatedHours >= :estimatedHoursMin) " +
           "AND (:estimatedHoursMax IS NULL OR t.estimatedHours <= :estimatedHoursMax) " +
           "AND (:progressMin IS NULL OR t.progress >= :progressMin) " +
           "AND (:progressMax IS NULL OR t.progress <= :progressMax) " +
           "AND (:dueDateFrom IS NULL OR t.dueDate >= :dueDateFrom) " +
           "AND (:dueDateTo IS NULL OR t.dueDate <= :dueDateTo) " +
           "AND (:tags IS NULL OR tag IN :tags)")
    Page<Task> findWithAdvancedFilters(@Param("workspaceId") Long workspaceId,
                                      @Param("assigneeId") Long assigneeId,
                                      @Param("parentTaskId") Long parentTaskId,
                                      @Param("status") StatusTaskEnum status,
                                      @Param("priority") PriorityEnum priority,
                                      @Param("estimatedHoursMin") Integer estimatedHoursMin,
                                      @Param("estimatedHoursMax") Integer estimatedHoursMax,
                                      @Param("progressMin") Integer progressMin,
                                      @Param("progressMax") Integer progressMax,
                                      @Param("dueDateFrom") LocalDateTime dueDateFrom,
                                      @Param("dueDateTo") LocalDateTime dueDateTo,
                                      @Param("tags") List<String> tags,
                                      Pageable pageable);

    // Full-text search
    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.notes) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Task> searchByText(@Param("query") String query, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND (" +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.notes) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Task> searchByTextInWorkspace(@Param("workspaceId") Long workspaceId, 
                                      @Param("query") String query, 
                                      Pageable pageable);

    // Subtask queries
    List<Task> findByParentTaskOrderByCreatedAtAsc(Task parentTask);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.parentTask = :parentTask")
    Long countSubtasks(@Param("parentTask") Task parentTask);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.parentTask = :parentTask AND t.status = 'COMPLETED'")
    Long countCompletedSubtasks(@Param("parentTask") Task parentTask);

    // Tag queries
    @Query("SELECT DISTINCT tag FROM Task t JOIN t.tags tag WHERE t.workspace.id = :workspaceId " +
           "GROUP BY tag ORDER BY COUNT(tag) DESC")
    List<String> findMostUsedTagsInWorkspace(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query("SELECT t FROM Task t JOIN t.tags tag WHERE tag = :tag AND t.workspace.id = :workspaceId")
    List<Task> findByTagInWorkspace(@Param("tag") String tag, @Param("workspaceId") Long workspaceId);

    // Dashboard statistics
    @Query("SELECT COUNT(t) FROM Task t WHERE t.workspace.id = :workspaceId")
    Long countTasksInWorkspace(@Param("workspaceId") Long workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.workspace.id = :workspaceId AND t.status = :status")
    Long countTasksByStatusInWorkspace(@Param("workspaceId") Long workspaceId, @Param("status") StatusTaskEnum status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.workspace.id = :workspaceId AND t.assignedTo.id = :userId")
    Long countTasksAssignedToUserInWorkspace(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    // Analytics support methods
    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.assignedTo.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByWorkspaceIdAndAssignedToIdAndCreatedAtBetween(@Param("workspaceId") Long workspaceId, 
                                                                   @Param("userId") Long userId, 
                                                                   @Param("startDate") OffsetDateTime startDate, 
                                                                   @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByWorkspaceIdAndCreatedAtBetween(@Param("workspaceId") Long workspaceId, 
                                                   @Param("startDate") OffsetDateTime startDate, 
                                                   @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByAssignedToIdAndCreatedAtBetween(@Param("userId") Long userId, 
                                                    @Param("startDate") OffsetDateTime startDate, 
                                                    @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByCreatedAtBetween(@Param("startDate") OffsetDateTime startDate, 
                                     @Param("endDate") OffsetDateTime endDate);
}