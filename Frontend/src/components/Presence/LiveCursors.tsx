import { useEffect, useState } from "react";
import { useWebSocketEvent } from "../../hooks/useWebSocket";

interface CursorData {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

interface LiveCursorsProps {
  workspaceId?: string;
  taskId?: string;
}

const cursorColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF9F43",
];

export function LiveCursors({ workspaceId, taskId }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());

  const assignColor = (userId: string) => {
    if (!colorMap.has(userId)) {
      const color = cursorColors[colorMap.size % cursorColors.length];
      setColorMap((prev) => new Map(prev).set(userId, color));
      return color;
    }
    return colorMap.get(userId)!;
  };

  useWebSocketEvent("user:cursor", (data) => {
    const color = assignColor(data.userId);
    setCursors((prev) =>
      new Map(prev).set(data.userId, {
        ...data,
        color,
      })
    );

    setTimeout(() => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.delete(data.userId);
        return newCursors;
      });
    }, 3000);
  });

  useEffect(() => {
    const handleMouseMove = () => {
      if (workspaceId || taskId) {
        const now = Date.now();
        if (
          !handleMouseMove.lastUpdate ||
          now - handleMouseMove.lastUpdate > 50
        ) {
          handleMouseMove.lastUpdate = now;
        }
      }
    };

    handleMouseMove.lastUpdate = 0;
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [workspaceId, taskId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-2px, -2px)",
          }}
        >
          {/* Cursor SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-lg"
          >
            <path
              d="M12 2L22 12L17 12L22 22L16 18L12 22L12 2Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* User name label */}
          <div
            className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap pointer-events-none"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
}
