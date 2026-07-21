"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathRef = useRef(pathname);

  useEffect(() => {
    if (pathRef.current !== pathname) {
      setLoading(true);
      pathRef.current = pathname;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLoading(false), 300);
    }
  }, [pathname, searchParams]);

  return (
    <div className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div
        className={`h-full bg-primary transition-all duration-500 ease-out ${loading ? "w-full opacity-100" : "w-0 opacity-0"}`}
        style={{ transitionDuration: loading ? "2s" : "0.3s" }}
      />
    </div>
  );
}
