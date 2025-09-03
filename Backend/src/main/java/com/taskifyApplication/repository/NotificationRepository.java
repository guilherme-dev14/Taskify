package com.taskifyApplication.repository;

import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<Notification> findByUserAndReadOrderByCreatedAtDesc(User user, Boolean read, Pageable pageable);
    
    Page<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, Notification.NotificationType type, Pageable pageable);
    
    Page<Notification> findByUserAndWorkspaceOrderByCreatedAtDesc(User user, Workspace workspace, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.read = false")
    Long countUnreadByUser(@Param("user") User user);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.read = false AND " +
           "n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentUnreadByUser(@Param("user") User user, 
                                            @Param("since") OffsetDateTime since);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user")
    void markAllAsReadForUser(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id IN :ids")
    void markAsReadByIds(@Param("ids") List<Long> ids);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND " +
           "(:read IS NULL OR n.read = :read) AND " +
           "(:type IS NULL OR n.type = :type) AND " +
           "(:workspaceId IS NULL OR n.workspace.id = :workspaceId) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findWithFilters(@Param("user") User user,
                                     @Param("read") Boolean read,
                                     @Param("type") Notification.NotificationType type,
                                     @Param("workspaceId") Long workspaceId,
                                     Pageable pageable);
    
    // Cleanup old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") OffsetDateTime cutoffDate);
}