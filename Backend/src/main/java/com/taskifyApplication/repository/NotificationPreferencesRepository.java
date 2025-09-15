package com.taskifyApplication.repository;

import com.taskifyApplication.model.NotificationPreferences;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Long> {

    Optional<NotificationPreferences> findByUser(User user);
    
    Optional<NotificationPreferences> findByUserId(Long userId);
    
    void deleteByUser(User user);
}