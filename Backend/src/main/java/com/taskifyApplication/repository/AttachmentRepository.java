package com.taskifyApplication.repository;

import com.taskifyApplication.model.Attachment;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    Page<Attachment> findByTaskOrderByUploadedAtDesc(Task task, Pageable pageable);
    
    Page<Attachment> findByWorkspaceOrderByUploadedAtDesc(Workspace workspace, Pageable pageable);
    
    List<Attachment> findByTaskAndIsLatestVersionTrue(Task task);
    
    List<Attachment> findByParentAttachmentOrderByVersionAsc(Attachment parentAttachment);
    
    @Query("SELECT a FROM Attachment a WHERE a.task.id = :taskId AND " +
           "(:mimeType IS NULL OR a.mimeType LIKE %:mimeType%) AND " +
           "(:fromDate IS NULL OR a.uploadedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR a.uploadedAt <= :toDate)")
    Page<Attachment> findWithFilters(@Param("taskId") Long taskId,
                                   @Param("mimeType") String mimeType,
                                   @Param("fromDate") OffsetDateTime fromDate,
                                   @Param("toDate") OffsetDateTime toDate,
                                   Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.task = :task")
    Long countByTask(@Param("task") Task task);
    
    @Query("SELECT SUM(a.size) FROM Attachment a WHERE a.workspace = :workspace")
    Long getTotalSizeByWorkspace(@Param("workspace") Workspace workspace);
}