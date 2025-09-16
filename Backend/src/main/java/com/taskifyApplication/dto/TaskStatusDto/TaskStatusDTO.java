package com.taskifyApplication.dto.TaskStatusDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusDTO {
    private Long id;
    private String name;
    private String color;
}
