"use client";

import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ tags, onChange }: TagSelectorProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Tags"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addTag}
        placeholder="Add a tag and press Enter"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag}>
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="ml-1 text-foreground/40 hover:text-brand-mid"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
