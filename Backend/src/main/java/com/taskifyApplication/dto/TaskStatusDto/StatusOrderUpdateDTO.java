package com.taskifyApplication.dto.TaskStatusDto;

import lombok.Data;

@Data
public class StatusOrderUpdateDTO {
    private Long id;
    private int order;
    // Lombok vai gerar os getters e setters
}
