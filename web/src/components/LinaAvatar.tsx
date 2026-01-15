"use client";
import Image from "next/image";
import React from "react";

type LinaAvatarSize = "sm" | "md" | "lg";

interface LinaAvatarProps {
  size?: LinaAvatarSize;
  className?: string;
  style?: React.CSSProperties;
}

const sizeConfig = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 160, height: 160 },
};

export default function LinaAvatar({ size = "md", className = "", style }: LinaAvatarProps) {
  const { width, height } = sizeConfig[size];

  return (
    <Image
      src="/branding/lina-avatar.png"
      alt="Lina AI"
      width={width}
      height={height}
      className={`rounded-full object-cover ${className}`}
      style={{
        borderRadius: "50%",
        ...style,
      }}
      quality={100}
      priority={size === "lg"}
    />
  );
}