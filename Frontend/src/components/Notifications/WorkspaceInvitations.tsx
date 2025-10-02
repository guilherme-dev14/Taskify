import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  XMarkIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { type IWorkspaceInvitation } from "../../types/workspace.types";
import { formatDate } from "../../utils/dateUtils";

export const WorkspaceInvitations: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["workspace-invitations"],
    queryFn: workspaceService.getPendingInvitations,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const respondMutation = useMutation({
    mutationFn: (data: { invitationId: number; accept: boolean }) =>
      workspaceService.respondToInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const handleResponse = (invitationId: number, accept: boolean) => {
    respondMutation.mutate({ invitationId, accept });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <UsersIcon className="w-5 h-5" />
        Workspace Invitations ({invitations.length})
      </h3>

      <AnimatePresence>
        {invitations.map((invitation) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {invitation.workspaceName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invited by {invitation.inviterName}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You have been invited to join{" "}
                    <span className="font-medium">
                      {invitation.workspaceName}
                    </span>{" "}
                    as a{" "}
                    <span className="font-medium">
                      {invitation.proposedRole}
                    </span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-3 h-3" />
                    Invited {formatDate(invitation.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(invitation.id, true)}
                    disabled={respondMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(invitation.id, false)}
                    disabled={respondMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
