import React from "react";

import type { UseVersioningApi } from "./useVersioning";

interface Props {
  api: UseVersioningApi;
  isOpen: boolean;
  onClose: () => void;
}

export const VersionDropdown: React.FC<Props> = ({ api, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 8,
        zIndex: 50,
        width: 280,
        maxHeight: 320,
        overflowY: "auto",
        background: "var(--color-background-primary, #fff)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: 6,
        border: "1px solid var(--color-gray-30, #ccc)",
        fontSize: 12,
        padding: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <strong>Saved Versions</strong>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
          aria-label="Close versions list"
        >
          ✕
        </button>
      </div>
      {api.versions.length === 0 && (
        <div style={{ padding: 8 }}>No versions yet.</div>
      )}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {api.versions.map((v) => (
          <li
            key={v.id}
            style={{
              border: "1px solid var(--color-gray-30, #ddd)",
              padding: 6,
              borderRadius: 4,
              background:
                v.id === api.lastSavedId
                  ? "var(--color-gray-10, #f5f5f5)"
                  : "var(--color-background-secondary, #fafafa)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontWeight: 600, wordBreak: "break-word" }}>
              {v.label}
            </div>
            <div style={{ opacity: 0.7 }}>
              {new Date(v.timestamp).toLocaleString()}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "4px 6px",
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                }}
                onClick={() => api.restoreVersion(v.id)}
              >
                Restore
              </button>
              <button
                type="button"
                style={{
                  padding: "4px 6px",
                  background: "var(--color-danger, #c62828)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                }}
                onClick={() => api.deleteVersion(v.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {api.versions.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            style={{
              width: "100%",
              padding: "4px 6px",
              background: "var(--color-gray-20, #e0e0e0)",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: "var(--color-text-primary)",
            }}
            onClick={() => {
              if (window.confirm("Delete all saved versions?")) {
                api.clearAll();
              }
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
