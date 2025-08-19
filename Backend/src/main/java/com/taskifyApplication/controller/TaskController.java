package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.CreateTaskDTO;
import com.taskifyApplication.dto.TaskDto.TaskDetailDTO;
import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.service.TaskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping(name = "getAllTasksFromUser")
    public ResponseEntity<List<TaskSummaryDTO>> getAllTasksFromUser() {
        try {
            List<TaskSummaryDTO> task = taskService.getAllTasksFromUser();
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping
    public ResponseEntity<TaskDetailDTO> getTaskById(Long id) {
        try {
            TaskDetailDTO task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@RequestBody CreateTaskDTO createTaskDTO) {
        try {
            TaskResponseDTO task = taskService.createTask(createTaskDTO);
            return ResponseEntity.ok(task);
        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping
    public ResponseEntity deleteCurrentTask(Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
