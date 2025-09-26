import React, { useEffect } from "react";

interface Props {
  message: string;
  onDone: () => void;
  duration?: number;
}

export const VersionToast: React.FC<Props> = ({
  message,
  onDone,
  duration = 2000,
}) => {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        background: "#2e7d32",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        zIndex: 100,
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: 16 }}>✔</span>
      <span>{message}</span>
    </div>
  );
};
