/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { ShareWorkspaceModal } from "../Modals/ShareWorkspace";
import type {
  IWorkspaceName,
  IWorkspaceMemberResponse,
  IInviteUserRequest,
  IUpdateMemberRoleRequest,
  IRemoveMemberRequest,
} from "../../types/workspace.types";

export const WorkspaceSettings: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<IWorkspaceName[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<IWorkspaceName | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    IWorkspaceMemberResponse[]
  >([]);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceData();
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workspaceService.getWorkspacesFromUser();
      setWorkspaces(data);
      if (data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(data[0]);
      }
    } catch (error) {
      setError("Failed to load workspaces");
      console.error("Error fetching workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkspaceData = async () => {
    if (!selectedWorkspace) return;

    try {
      setError(null);
      const [members, code] = await Promise.all([
        workspaceService.getWorkspaceMembers(selectedWorkspace.id),
        workspaceService.getInviteCode(selectedWorkspace.id),
      ]);
      setWorkspaceMembers(members);
      setInviteCode(code);
    } catch (error) {
      setError("Failed to load workspace data");
      console.error("Error fetching workspace data:", error);
    }
  };

  const handleInviteUser = async (data: IInviteUserRequest) => {
    if (!selectedWorkspace) return;

    try {
      await workspaceService.inviteUserByUsername(selectedWorkspace.id, data);
      await fetchWorkspaceData();
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!selectedWorkspace) return;

    try {
      const newCode = await workspaceService.regenerateInviteCode(
        selectedWorkspace.id
      );
      setInviteCode(newCode);
    } catch (error) {
      console.error("Error regenerating invite code:", error);
      throw error;
    }
  };

  const handleUpdateMemberRole = async (
    userId: number,
    newRole: "ADMIN" | "MEMBER"
  ) => {
    if (!selectedWorkspace) return;

    try {
      const updateData: IUpdateMemberRoleRequest = {
        workspaceId: selectedWorkspace.id,
        userId,
        newRole,
      };
      await workspaceService.updateMemberRole(updateData);
      await fetchWorkspaceData();
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedWorkspace) return;

    try {
      const removeData: IRemoveMemberRequest = {
        workspaceId: selectedWorkspace.id,
        userId,
      };
      await workspaceService.removeMember(removeData);
      await fetchWorkspaceData();
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Workspaces Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new workspace or join an existing one to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto -m-8">
      <div className="p-6 md:p-8 lg:p-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workspace Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Workspaces
              </h2>
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => setSelectedWorkspace(workspace)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedWorkspace?.id === workspace.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {workspace.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {workspace.id}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Workspace Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedWorkspace && (
              <div className="space-y-6">
                {/* Workspace Info & Actions */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedWorkspace.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {workspaceMembers.length} member
                        {workspaceMembers.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      <span>Share Workspace</span>
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Total Members
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {workspaceMembers.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Invite Code
                          </p>
                          <p className="text-xl font-mono font-bold text-green-700 dark:text-green-300">
                            {inviteCode || "Loading..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Members
                  </h3>

                  {workspaceMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No members found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workspaceMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {member.user.firstName} {member.user.lastName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {member.user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full ${
                                member.isOwner
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                                  : member.role === "ADMIN"
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {member.isOwner ? "Owner" : member.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <ShareWorkspaceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workspaceId={selectedWorkspace?.id || 0}
        workspaceName={selectedWorkspace?.name || ""}
        inviteCode={inviteCode}
        members={workspaceMembers}
        onInviteUser={handleInviteUser}
        onRegenerateInviteCode={handleRegenerateInviteCode}
        onUpdateMemberRole={handleUpdateMemberRole}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
};
