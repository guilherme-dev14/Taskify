package com.taskifyApplication.repository;

import com.taskifyApplication.model.TimeTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TimeTrackingRepository extends JpaRepository<TimeTracking, Long> {

    List<TimeTracking> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.isActive = true")
    List<TimeTracking> findActiveSessionsByUser(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(tt.duration), 0) FROM TimeTracking tt WHERE tt.task.id = :taskId AND tt.duration IS NOT NULL")
    Integer getTotalDurationByTask(@Param("taskId") Long taskId);

    @Query("SELECT tt FROM TimeTracking tt WHERE tt.user.id = :userId AND tt.createdAt BETWEEN :startDate AND :endDate ORDER BY tt.createdAt DESC")
    List<TimeTracking> findByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    void deleteByTaskIdIn(List<Long> taskIds);

    void deleteByTaskId(Long taskId);

}