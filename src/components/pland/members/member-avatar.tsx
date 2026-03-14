"use client";

import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  color: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function MemberAvatar({ name, color, size = "md" }: MemberAvatarProps) {
  const fallbackColor = "#6b7280";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium text-white",
        sizeClasses[size]
      )}
      style={{ backgroundColor: color || fallbackColor }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
