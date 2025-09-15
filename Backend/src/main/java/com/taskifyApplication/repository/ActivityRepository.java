package com.taskifyApplication.repository;

import com.taskifyApplication.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    // Find recent activities with pagination
    Page<Activity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find activities by user
    Page<Activity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find activities by workspace
    Page<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId, Pageable pageable);


    // Find activities by user and workspace
    Page<Activity> findByUserIdAndWorkspaceIdOrderByCreatedAtDesc(Long userId, Long workspaceId, Pageable pageable);

    List<Activity> deleteByWorkspaceId(Long workspaceId);

    // Find activities by date range
    @Query("SELECT a FROM Activity a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate, 
                                         Pageable pageable);
    
    // Find activities by workspace and date range
    @Query("SELECT a FROM Activity a WHERE a.workspace.id = :workspaceId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByWorkspaceIdAndCreatedAtBetween(@Param("workspaceId") Long workspaceId,
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate, 
                                                       Pageable pageable);
    
    // Find activities by user and date range
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate, 
                                                  Pageable pageable);
    
    // Find activities by type
    Page<Activity> findByTypeOrderByCreatedAtDesc(String type, Pageable pageable);
    
    // Find activities by task
    List<Activity> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    
    // Count activities by type in date range for statistics
    @Query("SELECT COUNT(a) FROM Activity a WHERE a.type = :type AND a.createdAt BETWEEN :startDate AND :endDate")
    Long countByTypeAndCreatedAtBetween(@Param("type") String type, 
                                       @Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    // Find activities by multiple types
    Page<Activity> findByTypeInOrderByCreatedAtDesc(List<String> types, Pageable pageable);
    
    // Recent activities for a specific limit (for dashboard)
    @Query(value = "SELECT * FROM activities ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<Activity> findRecentActivities(@Param("limit") int limit);
    
    // Delete all activities by user ID
    void deleteByUserId(Long userId);
}