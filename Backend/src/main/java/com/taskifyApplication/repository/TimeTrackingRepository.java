package com.taskifyApplication.repository;

import com.taskifyApplication.model.TimeTracking;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeTrackingRepository extends JpaRepository<TimeTracking, Long> {

    List<TimeTracking> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<TimeTracking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<TimeTracking> findByTaskIdAndUserIdAndIsActiveTrue(Long taskId, Long userId);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.isActive = true")
    List<TimeTracking> findActiveSessionsByUser(@Param("userId") Long userId);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.task.id = :taskId AND tt.isActive = true")
    List<TimeTracking> findActiveSessionsByTask(@Param("taskId") Long taskId);

    @Query("SELECT COALESCE(SUM(tt.duration), 0) FROM TimeTracking tt WHERE tt.task.id = :taskId AND tt.duration IS NOT NULL")
    Integer getTotalDurationByTask(@Param("taskId") Long taskId);

    @Query("SELECT COALESCE(SUM(tt.duration), 0) FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.duration IS NOT NULL AND tt.createdAt BETWEEN :startDate AND :endDate")
    Integer getTotalDurationByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.createdAt BETWEEN :startDate AND :endDate ORDER BY tt.createdAt DESC")
    List<TimeTracking> findByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.task.workspace.id = :workspaceId ORDER BY tt.createdAt DESC")
    List<TimeTracking> findByWorkspaceIdOrderByCreatedAtDesc(@Param("workspaceId") Long workspaceId);

    @Query("SELECT COALESCE(SUM(tt.duration), 0) FROM TimeTracking tt WHERE tt.task.workspace.id = :workspaceId AND tt.duration IS NOT NULL")
    Integer getTotalDurationByWorkspace(@Param("workspaceId") Long workspaceId);

    @Query("SELECT COUNT(tt) FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.isActive = true")
    Long countActiveSessionsByUser(@Param("userId") Long userId);

    void deleteByTaskIdIn(List<Long> taskIds);

    void deleteByTaskId(Long taskId);

    void deleteByUserId(Long userId);
}