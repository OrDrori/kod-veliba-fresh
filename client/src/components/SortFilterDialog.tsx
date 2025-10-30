import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  column: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "greaterThan" | "lessThan";
  value: string;
}

interface SortFilterDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "sort" | "filter";
  columns: { id: string; label: string }[];
  currentSort?: SortConfig;
  currentFilters?: FilterConfig[];
  onApplySort?: (sort: SortConfig) => void;
  onApplyFilter?: (filters: FilterConfig[]) => void;
  onClearSort?: () => void;
  onClearFilters?: () => void;
}

export default function SortFilterDialog({
  open,
  onClose,
  mode,
  columns,
  currentSort,
  currentFilters = [],
  onApplySort,
  onApplyFilter,
  onClearSort,
  onClearFilters,
}: SortFilterDialogProps) {
  // Sort state
  const [sortColumn, setSortColumn] = useState(currentSort?.column || columns[0]?.id || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(currentSort?.direction || "asc");

  // Filter state
  const [filters, setFilters] = useState<FilterConfig[]>(
    currentFilters.length > 0 ? currentFilters : [{ column: columns[0]?.id || "", operator: "contains", value: "" }]
  );

  const handleApplySort = () => {
    if (onApplySort && sortColumn) {
      onApplySort({ column: sortColumn, direction: sortDirection });
      onClose();
    }
  };

  const handleApplyFilter = () => {
    if (onApplyFilter) {
      const validFilters = filters.filter((f) => f.column && f.value);
      onApplyFilter(validFilters);
      onClose();
    }
  };

  const handleClearSort = () => {
    if (onClearSort) {
      onClearSort();
      setSortColumn(columns[0]?.id || "");
      setSortDirection("asc");
      onClose();
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
      setFilters([{ column: columns[0]?.id || "", operator: "contains", value: "" }]);
      onClose();
    }
  };

  const addFilter = () => {
    setFilters([...filters, { column: columns[0]?.id || "", operator: "contains", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof FilterConfig, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === "sort" ? "מיון נתונים" : "סינון נתונים"}</DialogTitle>
          <DialogDescription>
            {mode === "sort" ? "בחר עמודה וכיוון למיון" : "הוסף תנאי סינון לנתונים"}
          </DialogDescription>
        </DialogHeader>

        {mode === "sort" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sort-column">עמודה</Label>
              <Select value={sortColumn} onValueChange={setSortColumn}>
                <SelectTrigger id="sort-column">
                  <SelectValue placeholder="בחר עמודה" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-direction">כיוון</Label>
              <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as "asc" | "desc")}>
                <SelectTrigger id="sort-direction">
                  <SelectValue placeholder="בחר כיוון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">עולה (A→Z, 1→9)</SelectItem>
                  <SelectItem value="desc">יורד (Z→A, 9→1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {filters.map((filter, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg relative">
                {filters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 left-1 h-6 w-6 p-0"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label>עמודה</Label>
                  <Select value={filter.column} onValueChange={(v) => updateFilter(index, "column", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר עמודה" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>תנאי</Label>
                  <Select value={filter.operator} onValueChange={(v) => updateFilter(index, "operator", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תנאי" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">שווה ל</SelectItem>
                      <SelectItem value="contains">מכיל</SelectItem>
                      <SelectItem value="startsWith">מתחיל ב</SelectItem>
                      <SelectItem value="endsWith">מסתיים ב</SelectItem>
                      <SelectItem value="greaterThan">גדול מ</SelectItem>
                      <SelectItem value="lessThan">קטן מ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ערך</Label>
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, "value", e.target.value)}
                    placeholder="הזן ערך לחיפוש"
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addFilter} className="w-full">
              + הוסף תנאי נוסף
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2">
          {mode === "sort" ? (
            <>
              <Button variant="outline" onClick={handleClearSort}>
                נקה מיון
              </Button>
              <Button onClick={handleApplySort} className="bg-[#6366F1] text-[#1a1d2e] hover:bg-[#39ff14]">
                החל מיון
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClearFilters}>
                נקה סינון
              </Button>
              <Button onClick={handleApplyFilter} className="bg-[#6366F1] text-[#1a1d2e] hover:bg-[#39ff14]">
                החל סינון
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

