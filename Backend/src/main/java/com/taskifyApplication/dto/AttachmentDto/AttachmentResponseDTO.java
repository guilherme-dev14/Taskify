package com.taskifyApplication.dto.AttachmentDto;

import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponseDTO {

    private Long id;
    private String originalName;
    private String filePath;
    private String mimeType;
    private Long size;
    private OffsetDateTime uploadedAt;
    private UserSummaryDTO uploadedBy;
}