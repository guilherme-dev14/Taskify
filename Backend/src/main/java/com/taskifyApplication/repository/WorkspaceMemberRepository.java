package com.taskifyApplication.repository;


import com.taskifyApplication.model.RoleEnum;
import com.taskifyApplication.model.WorkspaceMember;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);


    boolean existsByWorkspaceAndUser(Workspace workspace, User user);
    @Query("SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM Workspace w " +
            "LEFT JOIN WorkspaceMember wm ON w.id = wm.workspace.id " +
            "WHERE w.id = :workspaceId AND " +
            "(w.owner = :user OR (wm.user = :user AND wm.role IN ('ADMIN', 'OWNER')))")

    boolean canUserManage(@Param("workspaceId") Long workspaceId, @Param("user") User user);



    @Modifying
    @Query("UPDATE WorkspaceMember wm SET wm.role = :newRole WHERE wm.workspace = :workspace AND wm.user = :user")
    int updateMemberRole(@Param("workspace") Workspace workspace, @Param("user") User user, @Param("newRole") RoleEnum newRole);

}
