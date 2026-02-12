"use client";

import React from "react";

type CookieSettingsLinkProps = {
  className?: string;
};

export default function CookieSettingsLink({ className }: CookieSettingsLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    window.zenivaOpenCookieSettings?.();
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      Cookie Settings
    </button>
  );
}
