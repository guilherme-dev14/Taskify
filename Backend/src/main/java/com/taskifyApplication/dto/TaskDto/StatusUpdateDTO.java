package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class StatusUpdateDTO {
    @NotNull(message = "Status is required")
    private StatusTaskEnum status;

    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
}