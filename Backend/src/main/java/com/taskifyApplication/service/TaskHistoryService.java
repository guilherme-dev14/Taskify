package com.taskifyApplication.service;

import com.taskifyApplication.dto.TaskDto.TaskHistoryDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TaskHistory;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.TaskHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskHistoryService {

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    @Autowired
    private UserService userService;

    public void recordChange(Task task, String fieldChanged, String oldValue, String newValue, String description) {
        User currentUser = userService.getCurrentUser();
        
        TaskHistory history = TaskHistory.builder()
            .task(task)
            .fieldChanged(fieldChanged)
            .oldValue(oldValue)
            .newValue(newValue)
            .description(description)
            .changedBy(currentUser)
            .build();
            
        taskHistoryRepository.save(history);
    }

    public List<TaskHistoryDTO> getTaskHistory(Long taskId) {
        List<TaskHistory> history = taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId);
        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Page<TaskHistoryDTO> getTaskHistory(Long taskId, Pageable pageable) {
        Page<TaskHistory> history = taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId, pageable);
        return history.map(this::convertToDTO);
    }

    public Page<TaskHistoryDTO> getWorkspaceHistory(Long workspaceId, Pageable pageable) {
        Page<TaskHistory> history = taskHistoryRepository.findByWorkspaceIdOrderByChangedAtDesc(workspaceId, pageable);
        return history.map(this::convertToDTO);
    }

    public void clearTaskHistory(Long taskId) {
        List<TaskHistory> historyEntries = taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId);
        taskHistoryRepository.deleteAll(historyEntries);
    }

    public void clearWorkspaceHistory(Long workspaceId) {
        List<TaskHistory> allHistory = taskHistoryRepository.findAll();
        List<TaskHistory> workspaceHistory = allHistory.stream()
            .filter(h -> h.getTask().getWorkspace().getId().equals(workspaceId))
            .toList();
        taskHistoryRepository.deleteAll(workspaceHistory);
    }

    private TaskHistoryDTO convertToDTO(TaskHistory history) {
        TaskHistoryDTO dto = new TaskHistoryDTO();
        dto.setId(history.getId());
        dto.setFieldChanged(history.getFieldChanged());
        dto.setOldValue(history.getOldValue());
        dto.setNewValue(history.getNewValue());
        dto.setDescription(history.getDescription());
        dto.setChangedAt(history.getChangedAt());
        
        UserSummaryDTO userDTO = new UserSummaryDTO();
        userDTO.setId(history.getChangedBy().getId());
        userDTO.setFirstName(history.getChangedBy().getName());
        userDTO.setEmail(history.getChangedBy().getEmail());
        dto.setChangedBy(userDTO);
        
        return dto;
    }
}