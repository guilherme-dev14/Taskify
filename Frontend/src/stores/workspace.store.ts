import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkspaceMember {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
  };
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
  isActive: boolean;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    username: string;
    email: string;
  };
  members: WorkspaceMember[];
  inviteCode?: string;
  settings: {
    isPrivate: boolean;
    allowGuestAccess: boolean;
    defaultTaskStatus: string;
    timeTrackingEnabled: boolean;
    notificationsEnabled: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeMemberCount: number;
    totalTimeTracked: number;
  };
}

export interface WorkspaceInvite {
  code: string;
  workspaceName: string;
  invitedBy: string;
  expiresAt: string;
  maxUses?: number;
  currentUses: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  memberWorkspaces: Workspace[];
  pendingInvites: WorkspaceInvite[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: number, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: number) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;

  addMember: (workspaceId: number, member: WorkspaceMember) => void;
  updateMember: (
    workspaceId: number,
    memberId: number,
    updates: Partial<WorkspaceMember>
  ) => void;
  removeMember: (workspaceId: number, memberId: number) => void;

  createInvite: (workspaceId: number) => Promise<string>;
  validateInvite: (code: string) => Promise<WorkspaceInvite>;
  joinWorkspaceByInvite: (code: string) => Promise<void>;
  revokeInvite: (workspaceId: number, code: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  handleWorkspaceUpdate: (workspace: Workspace) => void;
  handleMemberJoined: (workspaceId: number, member: WorkspaceMember) => void;
  handleMemberLeft: (workspaceId: number, memberId: number) => void;

  getUserRole: (workspaceId: number, userId: number) => string | null;
  getWorkspaceMembers: (workspaceId: number) => WorkspaceMember[];
  getActiveWorkspaces: () => Workspace[];
  canUserManageWorkspace: (workspaceId: number, userId: number) => boolean;
  getWorkspaceStats: (workspaceId: number) => Workspace["stats"] | null;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      memberWorkspaces: [],
      pendingInvites: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      setWorkspaces: (workspaces) =>
        set({
          workspaces,
          lastUpdated: new Date().toISOString(),
          error: null,
        }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [workspace, ...state.workspaces],
          lastUpdated: new Date().toISOString(),
        })),

      updateWorkspace: (id, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === id ? { ...ws, ...updates } : ws
          ),
          currentWorkspace:
            state.currentWorkspace?.id === id
              ? { ...state.currentWorkspace, ...updates }
              : state.currentWorkspace,
          lastUpdated: new Date().toISOString(),
        })),

      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((ws) => ws.id !== id),
          currentWorkspace:
            state.currentWorkspace?.id === id ? null : state.currentWorkspace,
          lastUpdated: new Date().toISOString(),
        })),

      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

      addMember: (workspaceId, member) =>
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, members: [...ws.members, member] }
              : ws
          ),
          currentWorkspace:
            state.currentWorkspace?.id === workspaceId
              ? {
                  ...state.currentWorkspace,
                  members: [...state.currentWorkspace.members, member],
                }
              : state.currentWorkspace,
        })),

      updateMember: (workspaceId, memberId, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  members: ws.members.map((member) =>
                    member.id === memberId ? { ...member, ...updates } : member
                  ),
                }
              : ws
          ),
        })),

      removeMember: (workspaceId, memberId) =>
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  members: ws.members.filter(
                    (member) => member.id !== memberId
                  ),
                }
              : ws
          ),
        })),

      createInvite: async (workspaceId) => {
        const inviteCode = `invite_${workspaceId}_${Date.now()}`;
        const invite: WorkspaceInvite = {
          code: inviteCode,
          workspaceName:
            get().workspaces.find((ws) => ws.id === workspaceId)?.name || "",
          invitedBy: "Current User",
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          currentUses: 0,
        };

        set((state) => ({
          pendingInvites: [...state.pendingInvites, invite],
        }));

        return inviteCode;
      },

      validateInvite: async (code) => {
        const invite = get().pendingInvites.find((inv) => inv.code === code);
        if (!invite) {
          throw new Error("Invalid invite code");
        }
        if (new Date(invite.expiresAt) < new Date()) {
          throw new Error("Invite code has expired");
        }
        return invite;
      },

      joinWorkspaceByInvite: async (code) => {
        const invite = await get().validateInvite(code);
      },

      revokeInvite: (workspaceId, code) =>
        set((state) => ({
          pendingInvites: state.pendingInvites.filter(
            (inv) => inv.code !== code
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      handleWorkspaceUpdate: (workspace) =>
        get().updateWorkspace(workspace.id, workspace),

      handleMemberJoined: (workspaceId, member) =>
        get().addMember(workspaceId, member),

      handleMemberLeft: (workspaceId, memberId) =>
        get().removeMember(workspaceId, memberId),

      getUserRole: (workspaceId, userId) => {
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        const member = workspace?.members.find((m) => m.user.id === userId);
        return member?.role || null;
      },

      getWorkspaceMembers: (workspaceId) => {
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        return workspace?.members || [];
      },

      getActiveWorkspaces: () => {
        return get().workspaces.filter((ws) =>
          ws.members.some((member) => member.isActive)
        );
      },

      canUserManageWorkspace: (workspaceId, userId) => {
        const userRole = get().getUserRole(workspaceId, userId);
        return userRole === "OWNER" || userRole === "ADMIN";
      },

      getWorkspaceStats: (workspaceId) => {
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        return workspace?.stats || null;
      },
    }),
    {
      name: "workspace-store",
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces,
      }),
    }
  )
);
