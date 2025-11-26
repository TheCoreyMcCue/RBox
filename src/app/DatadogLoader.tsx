"use client";

import { useEffect } from "react";

export default function DatadogLoader() {
  useEffect(() => {
    import("../../datadog");
  }, []);

  return null;
}
