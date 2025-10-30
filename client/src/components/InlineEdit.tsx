import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string) => void;
  type?: "text" | "select" | "number" | "email" | "tel";
  options?: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
}: InlineEditProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // For Select type
  if (type === "select" && options.length > 0) {
    return (
      <div className={cn("inline-block w-full", className)}>
        <Select
          value={String(value)}
          onValueChange={(newValue) => {
            onSave(newValue);
          }}
        >
          <SelectTrigger className="h-8 border-transparent hover:border-indigo-300 focus:border-indigo-500 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // For Text/Number/Email/Tel types
  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn("h-8 border-indigo-500 focus:ring-2 focus:ring-indigo-300", className)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors min-h-[32px] flex items-center",
        !value && "text-gray-400",
        className
      )}
    >
      {value || placeholder || "לחץ לעריכה"}
    </div>
  );
}
