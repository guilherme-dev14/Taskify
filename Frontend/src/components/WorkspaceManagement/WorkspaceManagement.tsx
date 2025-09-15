/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/WorkspaceManagement/WorkspaceManagement.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { BuildingOfficeIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import {
  workspaceService,
  type IWorkspacesResponse,
} from "../../services/Workspace/workspace.service";
import type {
  IWorkspace,
  IWorkspaceMemberResponse,
} from "../../types/workspace.types";
import { WorkspaceModal } from "../Modals/WorkspaceModal";
import { useToast } from "../../hooks/useToast";
import { UserAvatarGroup } from "../UI/UserAvatarBubble";
import type { IUserSummary } from "../../types/user.types";
interface WorkspaceDetails extends IWorkspace {
  id: number;
}

export const WorkspaceManagement: React.FC = () => {
  const [workspacesResponse, setWorkspacesResponse] =
    useState<IWorkspacesResponse | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<
    Record<number, WorkspaceDetails>
  >({});
  const [members, setMembers] = useState<
    Record<number, IWorkspaceMemberResponse[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const workspaces = workspacesResponse?.content || [];

  useEffect(() => {
    loadWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const response = await workspaceService.getWorkspacesFromUser(
        currentPage,
        6
      );
      setWorkspacesResponse(response);

      const workspacesList = response.content;

      const detailsPromises = workspacesList.map(async (workspace) => {
        try {
          const details = await workspaceService.getWorkspaceSummary(
            workspace.id.toString()
          );
          return { ...details, id: workspace.id };
        } catch (error) {
          console.error(`Error loading workspace ${workspace.id}:`, error);
          return null;
        }
      });

      const workspaceDetailsArray = await Promise.all(detailsPromises);
      const detailsMap: Record<number, WorkspaceDetails> = {};

      workspaceDetailsArray.forEach((details) => {
        if (details) {
          detailsMap[details.id] = details;
        }
      });

      setWorkspaceDetails(detailsMap);

      const membersPromises = workspacesList.map(async (workspace) => {
        try {
          const workspaceMembers = await workspaceService.getWorkspaceMembers(
            workspace.id
          );
          return { workspaceId: workspace.id, members: workspaceMembers };
        } catch (error) {
          console.error(
            `Error loading members for workspace ${workspace.id}:`,
            error
          );
          return { workspaceId: workspace.id, members: [] };
        }
      });

      const membersArray = await Promise.all(membersPromises);
      const membersMap: Record<number, IWorkspaceMemberResponse[]> = {};

      membersArray.forEach(({ workspaceId, members: workspaceMembers }) => {
        membersMap[workspaceId] = workspaceMembers;
      });

      setMembers(membersMap);
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = () => {
    setSelectedWorkspace(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditWorkspace = (workspace: WorkspaceDetails) => {
    setSelectedWorkspace(workspace);
    setModalMode("edit");
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteWorkspace = async (workspaceId: number) => {
    try {
      const workspace = workspaceDetails[workspaceId];

      await workspaceService.deleteWorkspace(workspaceId.toString());
      toast.success(
        "Workspace deletado",
        `O workspace "${
          workspace?.name || `ID: ${workspaceId}`
        }" foi deletado com sucesso.`
      );

      await loadWorkspaces();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting workspace:", error);

      const workspace = workspaceDetails[workspaceId];
      const workspaceName = workspace?.name || `ID: ${workspaceId}`;

      if (error.response?.status === 403) {
        toast.error(
          "Sem permissão",
          "Você não tem autorização para deletar este workspace."
        );
      } else if (error.response?.status === 404) {
        toast.warning(
          "Workspace não encontrado",
          "O workspace pode já ter sido deletado."
        );
        setTimeout(() => loadWorkspaces(), 2000);
      } else {
        toast.error("Erro inesperado", `Falha ao deletar "${workspaceName}".`);
      }
    }
  };

  const handleWorkspaceSubmit = async () => {
    await loadWorkspaces();
    setIsModalOpen(false);
  };

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = workspacesResponse?.totalPages ?? 0;

  if (isLoading && currentPage === 0) {
    // Show skeleton loader only on initial load
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
              <BuildingOfficeIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              Workspace Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your workspaces, members, and settings
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            New Workspace
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredWorkspaces.map((workspace, index) => {
              const details = workspaceDetails[workspace.id];
              const workspaceMembers = members[workspace.id] || [];

              return (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-6 hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {workspace.name}
                      </h3>
                      {details?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {details.description}
                        </p>
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === workspace.id
                              ? null
                              : workspace.id
                          );
                        }}
                        className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-60 group-hover:opacity-100 hover:opacity-100 ${
                          activeDropdown === workspace.id
                            ? "bg-gray-200 dark:bg-gray-700 opacity-100"
                            : ""
                        }`}
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === workspace.id && (
                          <>
                            {/* Backdrop for this specific dropdown */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveDropdown(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (details) {
                                    handleEditWorkspace(details);
                                  }
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit Workspace
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(workspace.id);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete Workspace
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {workspaceMembers.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                        <span>Tasks</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {details?.taskCount || 0}
                      </span>
                    </div>

                    {details?.createdAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>Created</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(details.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Owner */}
                  {details?.ownerName && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Owner:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {details.ownerName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Members Preview */}
                  {workspaceMembers.length > 0 && (
                    <div className="mt-4">
                      <UserAvatarGroup
                        users={
                          workspaceMembers.map((member) => ({
                            id: member.user.id,
                            username: member.user.username,
                            firstName: member.user.firstName,
                            lastName: member.user.lastName,
                            email: member.user.email,
                            profilePictureUrl: undefined,
                          })) as IUserSummary[]
                        }
                        size="sm"
                        maxVisible={4}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {filteredWorkspaces.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No workspaces found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first workspace to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateWorkspace}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5" />
                Create Workspace
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Workspace
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this workspace? This action
                  cannot be undone and will permanently delete all tasks and
                  data.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      showDeleteConfirm &&
                      handleDeleteWorkspace(showDeleteConfirm)
                    }
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Modal */}
      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        workspace={selectedWorkspace}
        onSubmit={handleWorkspaceSubmit}
      />
    </div>
  );
};
