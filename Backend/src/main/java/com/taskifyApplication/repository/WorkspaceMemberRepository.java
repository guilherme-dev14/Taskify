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
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);

    boolean existsByWorkspaceAndUser(Workspace workspace, User user);

    @Modifying
    @Query("UPDATE WorkspaceMember wm SET wm.role = :newRole WHERE wm.workspace = :workspace AND wm.user = :user")
    int updateMemberRole(@Param("workspace") Workspace workspace, @Param("user") User user, @Param("newRole") RoleEnum newRole);

}
