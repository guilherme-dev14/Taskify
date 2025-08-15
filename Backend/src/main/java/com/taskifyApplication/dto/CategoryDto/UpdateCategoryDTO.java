package com.taskifyApplication.dto.CategoryDto;


import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class UpdateCategoryDTO {
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
}
