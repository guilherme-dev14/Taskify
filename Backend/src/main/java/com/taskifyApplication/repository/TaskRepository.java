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
    List<Task> findByAssignedTo(User assignedTo);

    List<Task> findByWorkspace(Workspace workspace);
    
    Page<Task> findByWorkspace(Workspace workspace, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.status.id = :statusId " +
            "AND (:workspaceId IS NULL OR t.workspace.id = :workspaceId) " +
            "AND (t.dueDate BETWEEN :startDate AND :endDate)")
    List<Task> findByStatusAndDueDateBetween(@Param("statusId") Long statusId,
                                             @Param("workspaceId") Long workspaceId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace " +
           "AND (:statusId IS NULL OR t.status = :statusId) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    List<Task> findByWorkspaceWithFilters(@Param("workspace") Workspace workspace,
                                         @Param("statusId") Long statusId,
                                         @Param("priority") PriorityEnum priority);

    @Query("SELECT t FROM Task t WHERE t.workspace = :workspace " +
            "AND (:statusId IS NULL OR t.status.id = :statusId) " +
            "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByWorkspaceWithFiltersPageable(@Param("workspace") Workspace workspace,
                                                  @Param("statusId") Long statusId,
                                                  @Param("priority") PriorityEnum priority,
                                                  Pageable pageable);
    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user " +
            "AND (:statusId IS NULL OR t.status.id = :statusId) " +
            "AND (:workspace IS NULL OR t.workspace = :workspace)")
    List<Task> findByStatusWorkspaceAndAssignedTo(@Param("statusId") Long statusId,
                                                  @Param("user") User currentUser,
                                                  @Param("workspace") Workspace workspace);

    boolean existsByTitleAndWorkspace(String title, Workspace workspace);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.categories c WHERE c.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Long categoryId);

    long countByStatus(TaskStatus status);

    @Query("SELECT DISTINCT t FROM Task t " +
           "JOIN t.workspace w " +
           "JOIN w.members wm " +
           "WHERE (wm.user = :user OR w.owner = :user) " +
           "AND (:workspaceId IS NULL OR w.id = :workspaceId) " +
           "AND (:statusId IS NULL OR t.status.id = :statusId) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findAllTasksFromUserWorkspaces(@Param("user") User user,
                                              @Param("workspaceId") Long workspaceId,
                                              @Param("statusId") Long statusId,
                                              @Param("priority") PriorityEnum priority,
                                              Pageable pageable);


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

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user AND t.dueDate >= :startOfDay AND t.dueDate < :endOfDay AND t.status.name NOT IN :completedStatusNames")
    Integer countTasksDueToday(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay, @Param("completedStatusNames") List<String> completedStatusNames);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user AND t.status.name = :statusName")
    Integer countByUserAndStatusName(@Param("user") User user, @Param("statusName") String statusName);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user AND t.dueDate < :currentDateTime AND t.status.name NOT IN :completedStatusNames")
    Integer countOverdueTasks(@Param("user") User user, @Param("currentDateTime") LocalDateTime currentDateTime, @Param("completedStatusNames") List<String> completedStatusNames);

}