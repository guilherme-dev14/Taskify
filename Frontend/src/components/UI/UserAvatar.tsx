import React from "react";
import fileService from "../../services/File/file.service";

interface UserAvatarProps {
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
}) => {
  if (!user) {
    return null;
  }

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const getInitials = () => {
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getAvatarUrl = () => {
    if (!user.avatar) return null;
    return fileService.getAvatarUrl(user.avatar);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full flex-shrink-0 overflow-hidden`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {getInitials()}
        </div>
      )}
    </div>
  );
};
