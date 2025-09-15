package com.taskifyApplication.repository;

import com.taskifyApplication.model.TaskHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    
    List<TaskHistory> findByTaskIdOrderByChangedAtDesc(Long taskId);
    
    Page<TaskHistory> findByTaskIdOrderByChangedAtDesc(Long taskId, Pageable pageable);

    void deleteByTaskIdIn(List<Long> taskIds);

    @Query("SELECT th FROM TaskHistory th WHERE th.task.workspace.id = :workspaceId " +
           "ORDER BY th.changedAt DESC")
    Page<TaskHistory> findByWorkspaceIdOrderByChangedAtDesc(@Param("workspaceId") Long workspaceId, Pageable pageable);
}