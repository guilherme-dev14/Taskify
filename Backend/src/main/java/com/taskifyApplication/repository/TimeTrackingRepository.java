package com.taskifyApplication.repository;

import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TimeTracking;
import com.taskifyApplication.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeTrackingRepository extends JpaRepository<TimeTracking, Long> {

    List<TimeTracking> findByTaskOrderByStartTimeDesc(Task task);
    
    Page<TimeTracking> findByTaskOrderByStartTimeDesc(Task task, Pageable pageable);
    
    List<TimeTracking> findByUserOrderByStartTimeDesc(User user);
    
    Optional<TimeTracking> findByUserAndIsActiveTrue(User user);
    
    @Query("SELECT SUM(tt.duration) FROM TimeTracking tt WHERE tt.task = :task AND tt.endTime IS NOT NULL")
    Long getTotalTimeSpentOnTask(@Param("task") Task task);
    
    @Query("SELECT SUM(tt.duration) FROM TimeTracking tt WHERE tt.user = :user AND " +
           "tt.startTime >= :startDate AND tt.startTime <= :endDate AND tt.endTime IS NOT NULL")
    Long getTotalTimeSpentByUserInPeriod(@Param("user") User user, 
                                        @Param("startDate") OffsetDateTime startDate,
                                        @Param("endDate") OffsetDateTime endDate);
    
    @Query("SELECT tt FROM TimeTracking tt WHERE tt.task.workspace.id = :workspaceId AND " +
           "tt.startTime >= :startDate AND tt.startTime <= :endDate AND tt.endTime IS NOT NULL")
    List<TimeTracking> findByWorkspaceAndDateRange(@Param("workspaceId") Long workspaceId,
                                                  @Param("startDate") OffsetDateTime startDate,
                                                  @Param("endDate") OffsetDateTime endDate);
    
    @Query("SELECT COUNT(tt) FROM TimeTracking tt WHERE tt.user = :user AND tt.isActive = true")
    Long countActiveEntriesForUser(@Param("user") User user);
}