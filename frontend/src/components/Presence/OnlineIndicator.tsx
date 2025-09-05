interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OnlineIndicator({
  isOnline,
  size = "sm",
  className = "",
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        } ${isOnline ? "animate-pulse" : ""}`}
      />
      {isOnline && (
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping`}
        />
      )}
    </div>
  );
}
