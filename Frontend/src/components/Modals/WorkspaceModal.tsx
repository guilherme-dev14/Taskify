import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon, UserIcon, StarIcon } from "@heroicons/react/24/solid";
import { workspaceService } from "../../services/Workspace/workspace.service";
import type {
  IWorkspace,
  ICreateWorkspaceRequest,
  IUpdateWorkspaceRequest,
  IWorkspaceMemberResponse,
  IInviteUserRequest,
  IUpdateMemberRoleRequest,
} from "../../types/workspace.types";

interface WorkspaceDetails extends IWorkspace {
  id: number;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  workspace?: WorkspaceDetails | null;
  onSubmit: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  mode,
  workspace,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "members">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateWorkspaceRequest>({
    name: "",
    description: "",
  });

  // Member management state
  const [members, setMembers] = useState<IWorkspaceMemberResponse[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isLoadingInviteCode, setIsLoadingInviteCode] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && workspace) {
        setFormData({
          name: workspace.name,
          description: workspace.description,
        });
        loadMembers();
        loadInviteCode();
      } else {
        setFormData({
          name: "",
          description: "",
        });
        setMembers([]);
        setInviteCode("");
      }
      setActiveTab("details");
      setNotification(null);
    }
  }, [isOpen, mode, workspace]);

  const loadMembers = async () => {
    if (!workspace) return;

    try {
      const workspaceMembers = await workspaceService.getWorkspaceMembers(
        workspace.id
      );
      setMembers(workspaceMembers);
    } catch (error) {
      console.error("Error loading members:", error);
      showNotification("error", "Failed to load members");
    }
  };

  const loadInviteCode = async () => {
    if (!workspace) return;

    try {
      setIsLoadingInviteCode(true);
      const code = await workspaceService.getInviteCode(workspace.id);
      setInviteCode(code);
    } catch (error) {
      console.error("Error loading invite code:", error);
    } finally {
      setIsLoadingInviteCode(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (mode === "create") {
        await workspaceService.createWorkspace(formData);
        showNotification("success", "Workspace created successfully!");
      } else if (workspace) {
        const updateData: IUpdateWorkspaceRequest = {
          id: workspace.id,
          name: formData.name,
          description: formData.description,
        };
        await workspaceService.updateWorkspace(updateData);
        showNotification("success", "Workspace updated successfully!");
      }

      setTimeout(() => {
        onSubmit();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting workspace:", error);
      showNotification("error", `Failed to ${mode} workspace`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !inviteEmail.trim() || isInviting) return;

    try {
      setIsInviting(true);
      const inviteData: IInviteUserRequest = {
        email: inviteEmail.trim(),
        role: inviteRole,
      };

      await workspaceService.inviteUserByEmail(workspace.id, inviteData);
      setInviteEmail("");
      showNotification("success", "User invited successfully!");
      await loadMembers();
    } catch (error) {
      console.error("Error inviting user:", error);
      showNotification("error", "Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async (
    userId: number,
    newRole: "ADMIN" | "MEMBER"
  ) => {
    if (!workspace) return;

    try {
      const updateData: IUpdateMemberRoleRequest = {
        workspaceId: workspace.id,
        userId,
        newRole,
      };

      await workspaceService.updateMemberRole(updateData);
      showNotification("success", "Member role updated successfully!");
      await loadMembers();
    } catch (error) {
      console.error("Error updating member role:", error);
      showNotification("error", "Failed to update member role");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!workspace) return;

    try {
      await workspaceService.removeMember({
        workspaceId: workspace.id,
        userId,
      });
      showNotification("success", "Member removed successfully!");
      await loadMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("error", "Failed to remove member");
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!workspace) return;

    try {
      setIsLoadingInviteCode(true);
      const newCode = await workspaceService.regenerateInviteCode(workspace.id);
      setInviteCode(newCode);
      showNotification("success", "Invite code regenerated!");
    } catch (error) {
      console.error("Error regenerating invite code:", error);
      showNotification("error", "Failed to regenerate invite code");
    } finally {
      setIsLoadingInviteCode(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      showNotification("success", "Invite code copied to clipboard!");
    } catch (error) {
      showNotification("error", "Failed to copy invite code");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setMembers([]);
    setInviteEmail("");
    setInviteRole("MEMBER");
    setInviteCode("");
    setActiveTab("details");
    setNotification(null);
    onClose();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <StarIcon className="w-4 h-4 text-yellow-500" />;
      case "ADMIN":
        return <ShieldCheckIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-lg flex items-center gap-2 ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {notification.message}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === "create"
                    ? "Create New Workspace"
                    : "Edit Workspace"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {mode === "create"
                    ? "Set up a new workspace for your team"
                    : "Manage workspace settings and members"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab("details")}
              className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "details"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Details
              {activeTab === "details" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                />
              )}
            </button>

            {mode === "edit" && (
              <button
                onClick={() => setActiveTab("members")}
                className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "members"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <UserGroupIcon className="w-5 h-5" />
                Members ({members.length})
                {activeTab === "members" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === "details" ? (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Workspace Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter workspace name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Describe your workspace..."
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && (
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      )}
                      {mode === "create"
                        ? "Create Workspace"
                        : "Update Workspace"}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Invite Code Section */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <ClipboardDocumentIcon className="w-5 h-5" />
                      Workspace Invite Code
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 font-mono text-sm">
                        {isLoadingInviteCode ? (
                          <div className="flex items-center gap-2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          inviteCode || "No invite code available"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={copyInviteCode}
                        disabled={!inviteCode || isLoadingInviteCode}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateInviteCode}
                        disabled={isLoadingInviteCode}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  {/* Invite New Member */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <EnvelopeIcon className="w-5 h-5" />
                      Invite New Member
                    </h3>
                    <form onSubmit={handleInviteUser} className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter email address..."
                          required
                        />
                      </div>
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as "ADMIN" | "MEMBER")
                        }
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isInviting}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isInviting ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                        Invite
                      </button>
                    </form>
                  </div>

                  {/* Members List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5" />
                      Current Members ({members.length})
                    </h3>
                    <div className="space-y-3">
                      {members.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {member.user.firstName} {member.user.lastName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {member.user.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                                member.role
                              )}`}
                            >
                              {getRoleIcon(member.role)}
                              {member.role}
                            </div>

                            {!member.isOwner && (
                              <div className="flex items-center gap-1">
                                {member.role !== "ADMIN" && (
                                  <button
                                    onClick={() =>
                                      handleUpdateMemberRole(
                                        member.user.id,
                                        "ADMIN"
                                      )
                                    }
                                    className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    title="Promote to Admin"
                                  >
                                    <ShieldCheckIcon className="w-4 h-4" />
                                  </button>
                                )}
                                {member.role !== "MEMBER" && (
                                  <button
                                    onClick={() =>
                                      handleUpdateMemberRole(
                                        member.user.id,
                                        "MEMBER"
                                      )
                                    }
                                    className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                    title="Demote to Member"
                                  >
                                    <UserIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleRemoveMember(member.user.id)
                                  }
                                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  title="Remove Member"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {members.length === 0 && (
                      <div className="text-center py-8">
                        <UserCircleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No members yet
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
