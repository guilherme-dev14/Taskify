package com.taskifyApplication.repository;

import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwner(User owner);

    @Query("SELECT w FROM Workspace w JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
            "WHERE wm.user = :user AND wm.isActive = true")
    List<Workspace> findWorkspacesByMember(User user);
}