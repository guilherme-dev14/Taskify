package com.taskifyApplication.dto.WorkspaceDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponseDTO {
    private Long invitationId;
    private boolean accept; // true para aceitar, false para recusar
}