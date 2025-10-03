import React from "react";
import { type IUserSummary } from "../../types/user.types";

interface UserAvatarBubbleProps {
  user: IUserSummary;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const getInitials = (firstName: string = "", lastName: string = "") => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getGradientColor = (name: string) => {
  const colors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-pink-500 to-pink-600",
    "bg-gradient-to-br from-yellow-500 to-yellow-600",
    "bg-gradient-to-br from-red-500 to-red-600",
    "bg-gradient-to-br from-indigo-500 to-indigo-600",
    "bg-gradient-to-br from-teal-500 to-teal-600",
    "bg-gradient-to-br from-orange-500 to-orange-600",
    "bg-gradient-to-br from-cyan-500 to-cyan-600",
  ];

  const hash = name.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const UserAvatarBubble: React.FC<UserAvatarBubbleProps & { ownerInfo?: string }> = ({
  user,
  size = "md",
  showName = false,
  showTooltip = true,
  className = "",
  ownerInfo,
}) => {
  const initials = getInitials(user.firstName, user.lastName);
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "Unknown User";
  const gradientColor = getGradientColor(fullName);

  const avatarElement = (
    <div
      className={`
      ${sizeClasses[size]}
      ${gradientColor}
      rounded-full
      flex
      items-center
      justify-center
      text-white
      font-semibold
      shadow-md
      hover:shadow-lg
      transition-shadow
      cursor-pointer
      ${className}
    `}
    >
      <span className="select-none leading-none">{initials}</span>
    </div>
  );

  const content = (
    <div className="flex items-center space-x-2">
      {avatarElement}
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {fullName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      )}
    </div>
  );

  if (showTooltip && !showName) {
    return (
      <div className="avatar-bubble-wrapper relative">
        <div className="group/avatar relative">
          {avatarElement}

          {/* Tooltip */}
          <div
            className="
            invisible group-hover/avatar:visible
            absolute z-50
            bg-gray-900 dark:bg-gray-700
            text-white text-xs
            rounded-lg py-2 px-3
            -top-12 left-1/2
            transform -translate-x-1/2
            whitespace-nowrap
            shadow-lg
            transition-opacity duration-200
            pointer-events-none
            before:content-['']
            before:absolute
            before:top-full
            before:left-1/2
            before:transform
            before:-translate-x-1/2
            before:border-4
            before:border-transparent
            before:border-t-gray-900
            dark:before:border-t-gray-700
          "
          >
            <div className="font-medium">{fullName}</div>
            {ownerInfo && (
              <div className="text-yellow-400 font-semibold mt-1">{ownerInfo}</div>
            )}
            <div className="text-gray-300 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      </div>
    );
  }

  return content;
};

export const UserAvatarGroup: React.FC<{
  users: IUserSummary[];
  size?: "xs" | "sm" | "md" | "lg";
  maxVisible?: number;
  className?: string;
  ownerName?: string;
}> = ({ users, size = "sm", maxVisible = 3, className = "", ownerName }) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <UserAvatarBubble
            key={user.id}
            user={user}
            size={size}
            className="ring-2 ring-white dark:ring-gray-800 hover:z-10 relative"
            ownerInfo={index === 0 && ownerName ? `Owner: ${ownerName}` : undefined}
          />
        ))}

        {remainingCount > 0 && (
          <div
            className={`
              ${sizeClasses[size]}
              bg-gray-100 dark:bg-gray-700 
              rounded-full 
              flex 
              items-center 
              justify-center 
              text-gray-600 dark:text-gray-300
              font-medium
              ring-2 ring-white dark:ring-gray-800
              cursor-pointer
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
            `}
            title={`+${remainingCount} more`}
          >
            <span className="select-none">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};
