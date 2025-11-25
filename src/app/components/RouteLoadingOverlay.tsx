"use client";

import { useState, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function RouteLoadingOverlay({ children }: Props) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-amber-50/80 backdrop-blur-sm">
          <div className="animate-pulse text-amber-700 font-serif text-xl">
            Loading…
          </div>
        </div>
      )}
      {children}
    </>
  );
}
