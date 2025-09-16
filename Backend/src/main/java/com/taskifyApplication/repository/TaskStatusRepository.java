package com.taskifyApplication.repository;

import com.taskifyApplication.model.TaskStatus;
import com.taskifyApplication.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {

    List<TaskStatus> findByWorkspaceOrderByNameAsc(Workspace workspace);
}