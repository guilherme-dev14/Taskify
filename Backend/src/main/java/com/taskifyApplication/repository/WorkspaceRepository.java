package com.taskifyApplication.repository;

import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwner(User owner);

    Optional<Workspace> findByInviteCode(String inviteCode);

    @Query("SELECT w FROM Workspace w JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
            "WHERE wm.user = :user")
    List<Workspace> findWorkspacesByMember(User user);

    @Query("SELECT DISTINCT new com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO(w.id, w.name ) FROM Workspace w " +
            "LEFT JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
            "WHERE w.owner = :user OR (wm.user = :user)")
    Page<WorkspaceNameDTO> findAllAccessibleByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT DISTINCT new com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO(w.id, w.name ) FROM Workspace w " +
            "LEFT JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
            "WHERE w.owner = :user OR (wm.user = :user) ORDER BY w.name ASC")
    List<WorkspaceNameDTO> findAllAccessibleByUser(@Param("user") User user);

    @Query("SELECT CASE WHEN w.owner = :user THEN 'OWNER' " +
            "ELSE wm.role END " +
            "FROM Workspace w " +
            "LEFT JOIN WorkspaceMember wm ON w.id = wm.workspace.id AND wm.user = :user " +
            "WHERE w.id = :workspaceId")
    String getUserRoleInWorkspace(@Param("workspaceId") Long workspaceId, @Param("user") User user);

    boolean existsByInviteCode(String inviteCode);

    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END " +
           "FROM Workspace w " +
           "LEFT JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
           "WHERE w.id = :workspaceId AND (w.owner = :user OR wm.user = :user)")
    boolean accessibleForUser(@Param("user") User user, @Param("workspaceId") long workspaceId);
}