package com.taskifyApplication.repository;

import com.taskifyApplication.model.TaskComment;
import com.taskifyApplication.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskOrderByCreatedAtAsc(Task task);
    List<TaskComment> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    Page<TaskComment> findByTaskIdOrderByCreatedAtDesc(Long taskId, Pageable pageable);
}
