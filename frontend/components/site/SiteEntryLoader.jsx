"use client";

import { useEffect, useState } from "react";
import SiteLoadingScreen from "./SiteLoadingScreen";

export default function SiteEntryLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ultra-fast smooth 400ms fadeout, zero lag
    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, []);

  return <SiteLoadingScreen isVisible={isVisible} />;
}
