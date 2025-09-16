/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { ShareWorkspaceModal } from "../Modals/ShareWorkspace";
import type {
  IWorkspaceName,
  IWorkspaceMemberResponse,
  IInviteUserRequest,
  IUpdateMemberRoleRequest,
  IRemoveMemberRequest,
} from "../../types/workspace.types";
import { StatusManagement } from "./StatusManagement";
import { UserAvatarGroup } from "../UI/UserAvatarBubble";

// Adicione esta interface para ter a tipagem correta dos detalhes
interface WorkspaceDetails extends IWorkspaceName {
  description?: string;
  ownerName?: string;
  memberCount?: number;
  taskCount?: number;
  createdAt?: string;
}

export const WorkspaceSettings: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<IWorkspaceName[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<IWorkspaceName | null>(null);
  const [, setSelectedWorkspaceDetails] = useState<WorkspaceDetails | null>(
    null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    IWorkspaceMemberResponse[]
  >([]);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "statuses">("general");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceData(selectedWorkspace.id);
      setActiveTab("general");
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // CORREÇÃO: Acessa a propriedade 'content' da resposta paginada
      const response = await workspaceService.getWorkspacesFromUser();
      const workspacesList = response.content || [];
      setWorkspaces(workspacesList);

      if (workspacesList.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspacesList[0]);
      }
    } catch (error) {
      setError("Failed to load workspaces");
      console.error("Error fetching workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkspaceData = async (workspaceId: string | number) => {
    // CORREÇÃO: Garante que estamos usando um number
    const id = Number(workspaceId);
    if (isNaN(id)) return;

    try {
      setError(null);
      const [details, members, code] = await Promise.all([
        workspaceService.getWorkspaceSummary(id.toString()),
        workspaceService.getWorkspaceMembers(id),
        workspaceService.getInviteCode(id),
      ]);
      setSelectedWorkspaceDetails({ ...details, id });
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
      await workspaceService.inviteUserByUsername(
        Number(selectedWorkspace.id),
        data
      );
      await fetchWorkspaceData(selectedWorkspace.id);
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!selectedWorkspace) return;
    try {
      const newCode = await workspaceService.regenerateInviteCode(
        Number(selectedWorkspace.id)
      );
      setInviteCode(newCode);
    } catch (error) {
      console.error("Error regenerating invite code:", error);
      throw error;
    }
  };

  // CORREÇÃO: Ajusta a tipagem do 'newRole' para ser mais flexível
  const handleUpdateMemberRole = async (
    userId: number,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
  ) => {
    if (!selectedWorkspace) return;
    try {
      const updateData: IUpdateMemberRoleRequest = {
        workspaceId: Number(selectedWorkspace.id),
        userId,
        newRole: newRole as "ADMIN" | "MEMBER", // Faz o type assertion aqui
      };
      await workspaceService.updateMemberRole(updateData);
      await fetchWorkspaceData(selectedWorkspace.id);
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedWorkspace) return;
    try {
      const removeData: IRemoveMemberRequest = {
        workspaceId: Number(selectedWorkspace.id),
        userId,
      };
      await workspaceService.removeMember(removeData);
      await fetchWorkspaceData(selectedWorkspace.id);
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (workspaces.length === 0) {
    return <div>No workspaces found. Create one to get started.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto -m-8">
      <div className="p-6 md:p-8 lg:p-12">
        {error && <div className="text-red-500 mb-4">{error}</div>}

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
              <div className="space-y-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
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
                    <span>Share Workspace</span>
                  </button>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-6">
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`py-3 px-1 font-medium text-sm ${
                        activeTab === "general"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Members & Sharing
                    </button>
                    <button
                      onClick={() => setActiveTab("statuses")}
                      className={`py-3 px-1 font-medium text-sm ${
                        activeTab === "statuses"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Task Statuses
                    </button>
                  </nav>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "general" && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Members
                        </h3>
                        {workspaceMembers.length === 0 ? (
                          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No members found
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {workspaceMembers.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                              >
                                <UserAvatarGroup
                                  users={[
                                    {
                                      id: member.user.id,
                                      username: member.user.username,
                                      firstName: member.user.firstName,
                                      lastName: member.user.lastName,
                                      email: member.user.email,
                                    },
                                  ]}
                                  size="md"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "statuses" && (
                      <StatusManagement
                        workspaceId={Number(selectedWorkspace.id)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <ShareWorkspaceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workspaceId={selectedWorkspace?.id ? Number(selectedWorkspace.id) : 0}
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
