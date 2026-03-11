import { useState, useRef, useEffect } from "react";

/**
 * Tooltip that shows content on hover/focus.
 * @param {React.ReactNode} content - Content to show in the tooltip (can be string or JSX)
 * @param {string} [placement] - 'top' | 'bottom' (default: 'bottom')
 * @param {React.ReactNode} children - Trigger element(s)
 */
export default function Tooltip({ content, placement = "bottom", children }) {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e) => e.key === "Escape" && setVisible(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [visible]);

  const isBottom = placement === "bottom";

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <span
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 z-[200] px-3 py-2.5 w-72 rounded-xl border border-brintelli-border bg-white shadow-lg text-left text-sm text-text whitespace-normal pointer-events-none ${
            isBottom ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {typeof content === "string" ? (
            <p className="m-0">{content}</p>
          ) : (
            content
          )}
        </span>
      )}
    </span>
  );
}
