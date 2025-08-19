package com.taskifyApplication.service;

import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.WorkspaceRepository;

public class WorkspaceService {

    WorkspaceRepository workspaceRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }

    public Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepository.getReferenceById(workspaceId);
    }
}
