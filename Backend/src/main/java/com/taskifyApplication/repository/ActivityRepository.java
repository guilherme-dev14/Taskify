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

    Page<Activity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Activity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId, Pageable pageable);


    Page<Activity> findByUserIdAndWorkspaceIdOrderByCreatedAtDesc(Long userId, Long workspaceId, Pageable pageable);

    void deleteByWorkspaceId(Long workspaceId);

    @Query("SELECT a FROM Activity a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate, 
                                         Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.workspace.id = :workspaceId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByWorkspaceIdAndCreatedAtBetween(@Param("workspaceId") Long workspaceId,
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate, 
                                                       Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<Activity> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate, 
                                                  Pageable pageable);

    Page<Activity> findByTypeOrderByCreatedAtDesc(String type, Pageable pageable);

    List<Activity> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.type = :type AND a.createdAt BETWEEN :startDate AND :endDate")
    Long countByTypeAndCreatedAtBetween(@Param("type") String type, 
                                       @Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT * FROM activities ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<Activity> findRecentActivities(@Param("limit") int limit);

    void deleteByUserId(Long userId);
}