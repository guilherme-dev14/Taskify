package com.taskifyApplication.repository;

import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {

    @Query("SELECT wi FROM WorkspaceInvitation wi WHERE wi.invitedUser = :user AND wi.status = :status")
    List<WorkspaceInvitation> findByInvitedUserAndStatus(@Param("user") User user, @Param("status") WorkspaceInvitation.InvitationStatus status);

    boolean existsByWorkspaceAndInvitedUserAndStatus(Workspace workspace, User invitedUser, WorkspaceInvitation.InvitationStatus status);
}