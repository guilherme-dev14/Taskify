package com.taskifyApplication.dto.CategoryDto;


import lombok.Data;
import java.util.List;

@Data
public class CategoryStatsDTO {
    private Integer totalCategories;
    private List<CategoryUsageDTO> mostUsedCategories;
    private List<CategoryUsageDTO> leastUsedCategories;
}

