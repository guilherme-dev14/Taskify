package com.taskifyApplication.repository;

import com.taskifyApplication.model.PasswordResetToken;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void deleteAllByUser(User user);
}
