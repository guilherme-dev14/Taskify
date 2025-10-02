package com.taskifyApplication.dto.WorkspaceDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponseDTO {
    @NotNull(message = "Invitation ID is required")
    private Long invitationId;

    private boolean accept;
}