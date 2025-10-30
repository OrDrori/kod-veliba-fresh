import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface QuickEditProps {
  value: string | number;
  onSave: (newValue: string) => void;
  type?: "text" | "number" | "email" | "tel";
  className?: string;
  children: React.ReactNode;
}

/**
 * QuickEdit - Double-click to edit inline
 * Simple wrapper that adds inline editing to any cell
 */
export function QuickEdit({
  value,
  onSave,
  type = "text",
  className = "",
  children,
}: QuickEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== String(value)) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value || ""));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`cursor-pointer hover:bg-indigo-50/50 rounded transition-colors ${className}`}
        title="לחץ פעמיים לעריכה מהירה"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="relative"
    >
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-xs border-indigo-300 focus:border-indigo-500"
      />
    </div>
  );
}
