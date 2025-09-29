package com.taskifyApplication.repository;

import com.taskifyApplication.model.Attachment;
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

    List<Attachment> findByTaskId(Long taskId);

    @Query("SELECT a FROM Attachment a WHERE a.task.id = :taskId AND " +
           "(:mimeType IS NULL OR a.mimeType LIKE %:mimeType%) AND " +
           "(:fromDate IS NULL OR a.uploadedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR a.uploadedAt <= :toDate)")
    Page<Attachment> findWithFilters(@Param("taskId") Long taskId,
                                   @Param("mimeType") String mimeType,
                                   @Param("fromDate") OffsetDateTime fromDate,
                                   @Param("toDate") OffsetDateTime toDate,
                                   Pageable pageable);

}