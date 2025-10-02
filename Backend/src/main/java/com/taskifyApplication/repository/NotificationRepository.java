package com.taskifyApplication.repository;

import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.read = false")
    Long countUnreadByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user")
    void markAllAsReadForUser(@Param("user") User user);

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
}