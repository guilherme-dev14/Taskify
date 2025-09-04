package com.taskifyApplication.websocket;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionManager {

    // Map user ID to set of workspace IDs they're connected to
    private final Map<Long, Set<Long>> userWorkspaces = new ConcurrentHashMap<>();
    
    // Map user ID to set of task IDs they're watching
    private final Map<Long, Set<Long>> userTasks = new ConcurrentHashMap<>();
    
    // Map workspace ID to set of user IDs connected to it
    private final Map<Long, Set<Long>> workspaceUsers = new ConcurrentHashMap<>();
    
    // Map task ID to set of user IDs watching it
    private final Map<Long, Set<Long>> taskUsers = new ConcurrentHashMap<>();

    /**
     * Add user to workspace
     */
    public void addUserToWorkspace(Long userId, Long workspaceId) {
        userWorkspaces.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(workspaceId);
        workspaceUsers.computeIfAbsent(workspaceId, k -> ConcurrentHashMap.newKeySet()).add(userId);
    }

    /**
     * Remove user from workspace
     */
    public void removeUserFromWorkspace(Long userId, Long workspaceId) {
        Set<Long> userWs = userWorkspaces.get(userId);
        if (userWs != null) {
            userWs.remove(workspaceId);
            if (userWs.isEmpty()) {
                userWorkspaces.remove(userId);
            }
        }

        Set<Long> wsUsers = workspaceUsers.get(workspaceId);
        if (wsUsers != null) {
            wsUsers.remove(userId);
            if (wsUsers.isEmpty()) {
                workspaceUsers.remove(workspaceId);
            }
        }
    }

    /**
     * Add user to task watching
     */
    public void addUserToTask(Long userId, Long taskId) {
        userTasks.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(taskId);
        taskUsers.computeIfAbsent(taskId, k -> ConcurrentHashMap.newKeySet()).add(userId);
    }

    /**
     * Remove user from task watching
     */
    public void removeUserFromTask(Long userId, Long taskId) {
        Set<Long> userT = userTasks.get(userId);
        if (userT != null) {
            userT.remove(taskId);
            if (userT.isEmpty()) {
                userTasks.remove(userId);
            }
        }

        Set<Long> tUsers = taskUsers.get(taskId);
        if (tUsers != null) {
            tUsers.remove(userId);
            if (tUsers.isEmpty()) {
                taskUsers.remove(taskId);
            }
        }
    }

    /**
     * Remove user from all workspaces and tasks (on disconnect)
     */
    public void removeUser(Long userId) {
        // Remove from all workspaces
        Set<Long> userWs = userWorkspaces.remove(userId);
        if (userWs != null) {
            for (Long workspaceId : userWs) {
                Set<Long> wsUsers = workspaceUsers.get(workspaceId);
                if (wsUsers != null) {
                    wsUsers.remove(userId);
                    if (wsUsers.isEmpty()) {
                        workspaceUsers.remove(workspaceId);
                    }
                }
            }
        }

        // Remove from all tasks
        Set<Long> userT = userTasks.remove(userId);
        if (userT != null) {
            for (Long taskId : userT) {
                Set<Long> tUsers = taskUsers.get(taskId);
                if (tUsers != null) {
                    tUsers.remove(userId);
                    if (tUsers.isEmpty()) {
                        taskUsers.remove(taskId);
                    }
                }
            }
        }
    }

    /**
     * Get all workspaces a user is connected to
     */
    public Set<Long> getUserWorkspaces(Long userId) {
        return userWorkspaces.getOrDefault(userId, Collections.emptySet());
    }

    /**
     * Get all tasks a user is watching
     */
    public Set<Long> getUserTasks(Long userId) {
        return userTasks.getOrDefault(userId, Collections.emptySet());
    }

    /**
     * Get all users connected to a workspace
     */
    public Set<Long> getWorkspaceUsers(Long workspaceId) {
        return workspaceUsers.getOrDefault(workspaceId, Collections.emptySet());
    }

    /**
     * Get all users watching a task
     */
    public Set<Long> getTaskUsers(Long taskId) {
        return taskUsers.getOrDefault(taskId, Collections.emptySet());
    }

    /**
     * Check if user is online in workspace
     */
    public boolean isUserOnlineInWorkspace(Long userId, Long workspaceId) {
        Set<Long> userWs = userWorkspaces.get(userId);
        return userWs != null && userWs.contains(workspaceId);
    }

    /**
     * Check if user is watching task
     */
    public boolean isUserWatchingTask(Long userId, Long taskId) {
        Set<Long> userT = userTasks.get(userId);
        return userT != null && userT.contains(taskId);
    }

    /**
     * Get online users count for workspace
     */
    public int getOnlineUsersCount(Long workspaceId) {
        Set<Long> users = workspaceUsers.get(workspaceId);
        return users != null ? users.size() : 0;
    }

    /**
     * Get watching users count for task
     */
    public int getWatchingUsersCount(Long taskId) {
        Set<Long> users = taskUsers.get(taskId);
        return users != null ? users.size() : 0;
    }
}