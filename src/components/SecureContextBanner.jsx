import { useEffect, useMemo, useState } from "react";

/**
 * Global banner for camera/mic/screen-sharing requirement.
 * Browsers allow getUserMedia/getDisplayMedia only on HTTPS (or localhost).
 */
export default function SecureContextBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Persist dismissal for this browser tab/session
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("secureContextBannerDismissed");
      if (v === "1") setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    if (isLocalhost) return false;

    // Show only when the browser is actually blocking media APIs (common production issue)
    const mediaBlocked =
      !navigator?.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function" ||
      typeof navigator.mediaDevices.getDisplayMedia !== "function";

    // window.isSecureContext is the canonical signal for HTTPS requirement
    return !window.isSecureContext && mediaBlocked;
  }, [dismissed]);

  if (!shouldShow) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-amber-200/60 bg-amber-50">
      <div className="mx-auto flex w-full max-w-[1500px] items-start justify-between gap-3 px-4 py-3 text-sm text-amber-900 sm:px-6 lg:px-10">
        <div className="leading-snug">
          <span className="font-semibold">Camera / Mic / Screen Share requires HTTPS.</span>{" "}
          Your browser blocks camera/mic/screen-share on HTTP. Open this site using{" "}
          <span className="font-semibold">HTTPS</span> (or use localhost for testing).
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem("secureContextBannerDismissed", "1");
            } catch {
              // ignore
            }
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}


