package com.taskifyApplication.repository;

import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {

    @Query("SELECT wi FROM WorkspaceInvitation wi WHERE wi.invitedUser = :user AND wi.status = :status")
    List<WorkspaceInvitation> findByInvitedUserAndStatus(@Param("user") User user, @Param("status") WorkspaceInvitation.InvitationStatus status);

    @Query("SELECT wi FROM WorkspaceInvitation wi WHERE wi.workspace = :workspace AND wi.invitedUser = :user AND wi.status = 'PENDING'")
    Optional<WorkspaceInvitation> findPendingInvitation(@Param("workspace") Workspace workspace, @Param("user") User user);

    @Query("SELECT wi FROM WorkspaceInvitation wi WHERE wi.workspace = :workspace AND wi.status = :status")
    List<WorkspaceInvitation> findByWorkspaceAndStatus(@Param("workspace") Workspace workspace, @Param("status") WorkspaceInvitation.InvitationStatus status);

    @Query("SELECT wi FROM WorkspaceInvitation wi WHERE wi.status = 'PENDING' AND wi.createdAt < :expireDate")
    List<WorkspaceInvitation> findExpiredInvitations(@Param("expireDate") LocalDateTime expireDate);

    boolean existsByWorkspaceAndInvitedUserAndStatus(Workspace workspace, User invitedUser, WorkspaceInvitation.InvitationStatus status);
}