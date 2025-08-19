package com.taskifyApplication.repository;

import com.taskifyApplication.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkspace(Workspace workspace);
    List<Task> findByStatus(StatusTaskEnum status);
    List<Task> findByWorkspaceAndStatus(Workspace workspace, StatusTaskEnum status);
    List<Task> findByPriorityAndStatus(PriorityEnum priority, StatusTaskEnum status);
    List<Task> findByUser(Long userId);
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :start AND :end")
    List<Task> findTasksDueBetween(LocalDateTime start, LocalDateTime end);
}
