package com.taskifyApplication.dto.CategoryDto;


import lombok.Data;

@Data
public class CategorySummaryDTO {
    private Long id;
    private String name;
    private String description;
    private Integer taskCount;
}
