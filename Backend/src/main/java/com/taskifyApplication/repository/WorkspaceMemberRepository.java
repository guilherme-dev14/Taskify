package com.taskifyApplication.repository;


import com.taskifyApplication.model.WorkspaceMember;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    List<WorkspaceMember> findByWorkspaceAndIsActive(Workspace workspace, Boolean isActive);
    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);
    List<WorkspaceMember> findByUserAndIsActive(User user, Boolean isActive);
}
