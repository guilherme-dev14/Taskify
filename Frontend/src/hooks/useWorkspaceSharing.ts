import { useState, useCallback, useEffect } from "react";
import { workspaceService } from "../services/Workspace/workspace.service";
import type {
  IWorkspaceMemberResponse,
  IInviteUserRequest,
  IUpdateMemberRoleRequest,
} from "../types/workspace.types";

export const useWorkspaceSharing = (
  workspaceId: number,
  shouldLoad: boolean = false
) => {
  const [members, setMembers] = useState<IWorkspaceMemberResponse[]>([]);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId || hasLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const [membersData, code] = await Promise.all([
        workspaceService.getWorkspaceMembers(workspaceId),
        workspaceService.getInviteCode(workspaceId),
      ]);

      setMembers(membersData);
      setInviteCode(code);
      setHasLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspace data"
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceId, hasLoaded]);

  // Auto-load when shouldLoad is true
  useEffect(() => {
    if (shouldLoad && workspaceId && !hasLoaded) {
      loadWorkspaceData();
    }
  }, [shouldLoad, workspaceId, hasLoaded, loadWorkspaceData]);

  const inviteUser = useCallback(
    async (inviteData: IInviteUserRequest) => {
      try {
        await workspaceService.inviteToWorkspace(inviteData);
        // Reload members after successful invite
        setHasLoaded(false); // Force reload
        await loadWorkspaceData();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to invite user"
        );
      }
    },
    [workspaceId, loadWorkspaceData]
  );

  const regenerateInviteCode = useCallback(async () => {
    try {
      const newCode = await workspaceService.regenerateInviteCode(workspaceId);
      setInviteCode(newCode);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to regenerate code"
      );
    }
  }, [workspaceId]);

  const updateMemberRole = useCallback(
    async (memberId: number, newRole: "ADMIN" | "MEMBER") => {
      try {
        const updateData: IUpdateMemberRoleRequest = {
          workspaceId,
          userId: memberId,
          newRole,
        };
        await workspaceService.updateMemberRole(updateData);
        setMembers((prev) =>
          prev.map((member) =>
            member.user.id === memberId ? { ...member, role: newRole } : member
          )
        );
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update member role"
        );
      }
    },
    [workspaceId]
  );

  const removeMember = useCallback(
    async (memberId: number) => {
      try {
        await workspaceService.removeMember({ workspaceId, userId: memberId });
        setMembers((prev) =>
          prev.filter((member) => member.user.id !== memberId)
        );
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to remove member"
        );
      }
    },
    [workspaceId]
  );

  return {
    members,
    inviteCode,
    loading,
    error,
    loadWorkspaceData,
    inviteUser,
    regenerateInviteCode,
    updateMemberRole,
    removeMember,
  };
};
