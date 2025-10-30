import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableCellProps {
  value: any;
  type?: "text" | "number" | "email" | "tel" | "select";
  options?: { value: string; label: string }[];
  onSave: (newValue: any) => void;
  className?: string;
  displayValue?: string;
  renderDisplay?: (value: any) => React.ReactNode;
}

export function EditableCell({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  displayValue,
  renderDisplay,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`cursor-pointer hover:bg-indigo-50 rounded px-2 py-1 transition-colors ${className}`}
      >
        {renderDisplay ? renderDisplay(value) : (displayValue || value || "-")}
      </div>
    );
  }

  if (type === "select") {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1"
      >
        <Select
          value={editValue}
          onValueChange={(newValue) => {
            setEditValue(newValue);
            onSave(newValue);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-red-100 rounded"
        >
          <X className="w-3 h-3 text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1"
    >
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-xs"
      />
      <button
        onClick={handleSave}
        className="p-1 hover:bg-green-100 rounded"
      >
        <Check className="w-3 h-3 text-green-600" />
      </button>
      <button
        onClick={handleCancel}
        className="p-1 hover:bg-red-100 rounded"
      >
        <X className="w-3 h-3 text-red-600" />
      </button>
    </div>
  );
}
