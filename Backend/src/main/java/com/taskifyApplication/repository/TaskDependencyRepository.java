package com.taskifyApplication.repository;

import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {

    List<TaskDependency> findByTask(Task task);
    
    List<TaskDependency> findByDependsOnTask(Task dependsOnTask);
    
    Optional<TaskDependency> findByTaskAndDependsOnTask(Task task, Task dependsOnTask);
    
    @Query("SELECT td.dependsOnTask FROM TaskDependency td WHERE td.task = :task")
    List<Task> findDependenciesForTask(@Param("task") Task task);
    
    @Query("SELECT td.task FROM TaskDependency td WHERE td.dependsOnTask = :dependsOnTask")
    List<Task> findTasksDependingOn(@Param("dependsOnTask") Task dependsOnTask);
    
    // Check for circular dependencies
    @Query("SELECT CASE WHEN COUNT(td) > 0 THEN true ELSE false END FROM TaskDependency td " +
           "WHERE td.task = :dependsOnTask AND td.dependsOnTask = :task")
    boolean hasCircularDependency(@Param("task") Task task, @Param("dependsOnTask") Task dependsOnTask);

    List<TaskDependency> findByTaskIn(List<Task> tasks);

    List<TaskDependency> findByDependsOnTaskIn(List<Task> tasks);

    @Query("SELECT COUNT(td) FROM TaskDependency td WHERE td.task = :task")
    Long countDependenciesForTask(@Param("task") Task task);
}