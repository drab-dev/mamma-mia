import React, { useState } from "react";

import type { UseVersioningApi } from "./useVersioning";

interface Props {
  api: UseVersioningApi;
  onToggleList: () => void;
}

// Simple button placed in the top-right UI area.
export const SaveVersionButton: React.FC<Props> = ({ api, onToggleList }) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const label = window.prompt("Version label (optional)") || undefined;
    setSaving(true);
    await api.saveVersion(label);
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        type="button"
        onClick={handleSave}
        title="Save current board as a version"
        style={{
          padding: "4px 8px",
          fontSize: 12,
          cursor: "pointer",
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
        }}
        disabled={saving || api.isSaving}
      >
        {saving || api.isSaving ? "Saving..." : "Save Version"}
      </button>
      <button
        type="button"
        onClick={onToggleList}
        title="Show saved versions"
        style={{
          padding: "4px 8px",
          fontSize: 12,
          cursor: "pointer",
          background: "var(--color-gray-20)",
          color: "var(--color-text-primary)",
          border: "none",
          borderRadius: 4,
        }}
      >
        Versions ▾
      </button>
    </div>
  );
};
