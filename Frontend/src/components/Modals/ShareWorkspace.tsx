import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  IWorkspaceMemberResponse,
  IInviteUserRequest,
} from "../../types/workspace.types";
import { formatDate } from "../../utils/dateUtils";
import { useScreenSize, responsiveClasses, cn } from "../../utils/responsive";
import { useAuthStore } from "../../services/auth.store";

export interface ShareWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number;
  workspaceName: string;
  inviteCode?: string;
  members?: IWorkspaceMemberResponse[];
  onInviteUser?: (data: IInviteUserRequest) => Promise<void>;
  onRegenerateInviteCode?: () => Promise<void>;
  onUpdateMemberRole?: (
    memberId: number,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
  ) => Promise<void>;
  onRemoveMember?: (memberId: number) => Promise<void>;
}

export const ShareWorkspaceModal: React.FC<ShareWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  inviteCode,
  members = [],
  onInviteUser,
  onRegenerateInviteCode,
  onUpdateMemberRole,
  onRemoveMember,
}) => {
  const { isMobile, isSmallScreen } = useScreenSize();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"invite" | "members">("invite");
  const [inviteForm, setInviteForm] = useState<IInviteUserRequest>({
    email: "",
    role: "MEMBER",
  });
  const [isInviting, setIsInviting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onInviteUser || !inviteForm.email) return;

    setIsInviting(true);
    try {
      await onInviteUser(inviteForm);
      setInviteForm({ email: "", role: "MEMBER" });
    } catch (error) {
      console.error("Failed to invite user:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error("Failed to copy invite code:", error);
    }
  };

  const handleRegenerateCode = async () => {
    if (!onRegenerateInviteCode) return;

    try {
      await onRegenerateInviteCode();
    } catch (error) {
      console.error("Failed to regenerate invite code:", error);
    }
  };

  const handleRoleUpdate = async (
    memberId: number,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
  ) => {
    if (!onUpdateMemberRole) return;

    try {
      await onUpdateMemberRole(memberId, newRole);
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (
      !onRemoveMember ||
      !confirm("Are you sure you want to remove this member?")
    )
      return;

    try {
      await onRemoveMember(memberId);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              responsiveClasses.modal.full,
              "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden",
              isMobile ? "rounded-t-2xl rounded-b-none" : ""
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn(responsiveClasses.padding.full)}>
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between",
                  isMobile ? "mb-4" : "mb-8",
                  isSmallScreen ? "flex-col sm:flex-row gap-4 sm:gap-0" : ""
                )}
              >
                <div
                  className={cn(
                    isSmallScreen ? "text-center sm:text-left" : ""
                  )}
                >
                  <h2
                    className={cn(
                      responsiveClasses.text.heading,
                      "font-bold text-gray-900 dark:text-white"
                    )}
                  >
                    Share Workspace
                  </h2>
                  <p
                    className={cn(
                      responsiveClasses.text.body,
                      "text-gray-600 dark:text-gray-400 mt-1"
                    )}
                  >
                    Invite people to collaborate on "{workspaceName}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div
                className={cn(
                  "flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1",
                  isMobile ? "mb-4" : "mb-8"
                )}
              >
                <button
                  onClick={() => setActiveTab("invite")}
                  className={cn(
                    "flex-1 py-3 px-2 sm:px-4 rounded-md font-medium transition-colors",
                    responsiveClasses.text.small,
                    activeTab === "invite"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <svg
                    className={cn(
                      "inline",
                      isMobile ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  {isMobile ? "Invite" : "Invite People"}
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={cn(
                    "flex-1 py-3 px-2 sm:px-4 rounded-md font-medium transition-colors",
                    responsiveClasses.text.small,
                    activeTab === "members"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <svg
                    className="w-5 h-5 inline mr-2"
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
                  Members ({members.length})
                </button>
              </div>

              {/* Content */}
              <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
                {activeTab === "invite" && (
                  <div className="space-y-6">
                    {/* Invite by Code */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Share Invite Code
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Anyone with this code can join your workspace as a
                        member.
                      </p>

                      <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={inviteCode || "Loading..."}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white font-mono text-center text-lg"
                          />
                        </div>
                        <button
                          onClick={copyInviteCode}
                          className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                          {copiedCode ? (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
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
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleRegenerateCode}
                          className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </div>

                    {/* Invite by Email */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Invite by Email
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Send direct invitations to specific users.
                      </p>

                      <form onSubmit={handleInviteSubmit} className="space-y-4">
                        <div>
                          <input
                            type="email"
                            placeholder="Enter email address..."
                            value={inviteForm.email}
                            onChange={(e) =>
                              setInviteForm({
                                ...inviteForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white"
                            required
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <select
                            value={inviteForm.role}
                            onChange={(e) =>
                              setInviteForm({
                                ...inviteForm,
                                role: e.target.value as "ADMIN" | "MEMBER",
                              })
                            }
                            className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          <button
                            type="submit"
                            disabled={isInviting || !inviteForm.email}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isInviting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
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
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                  />
                                </svg>
                                <span>Send Invite</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-4">
                    {members.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 opacity-50"
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
                        <p>No members found</p>
                      </div>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {member.user.firstName} {member.user.lastName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {member.user.email}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Joined {formatDate(member.joinedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {member.isOwner || member.role === "OWNER" ? (
                              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-full">
                                Owner
                              </span>
                            ) : (
                              <>
                                <select
                                  value={member.role}
                                  onChange={(e) =>
                                    handleRoleUpdate(
                                      member.user.id,
                                      e.target.value as "ADMIN" | "MEMBER"
                                    )
                                  }
                                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="MEMBER">Member</option>
                                  <option value="ADMIN">Admin</option>
                                </select>

                                {/* Show delete button only if current user is the owner */}
                                {currentUser &&
                                  members.find(
                                    (m) =>
                                      m.user.id === currentUser.id && m.isOwner
                                  ) && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(member.user.id)
                                      }
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Remove member"
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
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
