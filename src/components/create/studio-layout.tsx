"use client";

import { type ReactNode } from "react";

interface StudioLayoutProps {
  left: ReactNode;
  right?: ReactNode;
}

export function StudioLayout({ left, right }: StudioLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-6">{left}</div>
      {right && (
        <div className="lg:sticky lg:top-24 space-y-6">
          {right}
        </div>
      )}
    </div>
  );
}
