import { useEffect, useState } from "react";

export default function useExpiry(expiresAt) {
  const [now, setNow] = useState(() => Date.now());
  const deadline = typeof expiresAt === "string" ? Date.parse(expiresAt) : NaN;

  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const interval = window.setInterval(refresh, 250);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [deadline]);

  return Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
}
