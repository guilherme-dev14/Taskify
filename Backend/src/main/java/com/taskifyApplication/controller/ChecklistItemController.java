package com.taskifyApplication.controller;

import com.taskifyApplication.model.ChecklistItem;
import com.taskifyApplication.service.ChecklistItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist-items")
public class ChecklistItemController {

    @Autowired
    private ChecklistItemService checklistItemService;

    /**
     * Get all checklist items for a task
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ChecklistItem>> getTaskChecklistItems(@PathVariable Long taskId) {
        List<ChecklistItem> items = checklistItemService.getTaskChecklistItems(taskId);
        return ResponseEntity.ok(items);
    }

    /**
     * Add a new checklist item to a task
     */
    @PostMapping("/task/{taskId}")
    public ResponseEntity<ChecklistItem> addChecklistItem(
            @PathVariable Long taskId,
            @RequestBody AddChecklistItemRequest request) {
        ChecklistItem item = checklistItemService.addChecklistItem(taskId, request.getText());
        return ResponseEntity.ok(item);
    }

    /**
     * Toggle completion status of a checklist item
     */
    @PutMapping("/{itemId}/toggle")
    public ResponseEntity<ChecklistItem> toggleChecklistItem(@PathVariable Long itemId) {
        ChecklistItem item = checklistItemService.toggleChecklistItem(itemId);
        return ResponseEntity.ok(item);
    }

    /**
     * Delete a checklist item
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long itemId) {
        checklistItemService.deleteChecklistItem(itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Request DTO for adding checklist items
     */
    public static class AddChecklistItemRequest {
        private String text;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}