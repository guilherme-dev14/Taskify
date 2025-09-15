package com.taskifyApplication.repository;

import com.taskifyApplication.model.ChecklistItem;
import com.taskifyApplication.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByTaskOrderByOrderIndexAsc(Task task);
    
    @Query("SELECT COUNT(ci) FROM ChecklistItem ci WHERE ci.task = :task")
    Long countByTask(@Param("task") Task task);
    
    @Query("SELECT COUNT(ci) FROM ChecklistItem ci WHERE ci.task = :task AND ci.completed = true")
    Long countCompletedByTask(@Param("task") Task task);
    
    @Query("SELECT COALESCE(MAX(ci.orderIndex), 0) FROM ChecklistItem ci WHERE ci.task = :task")
    Integer getMaxOrderIndexForTask(@Param("task") Task task);
    
    void deleteByTask(Task task);
}