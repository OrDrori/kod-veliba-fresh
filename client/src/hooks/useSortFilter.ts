import { useState, useEffect, useMemo } from "react";

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  column: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "greaterThan" | "lessThan";
  value: string;
}

export function useSortFilter<T extends Record<string, any>>(
  data: T[] | undefined,
  boardName: string
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSort = localStorage.getItem(`${boardName}-sort`);
    const savedFilters = localStorage.getItem(`${boardName}-filters`);

    if (savedSort) {
      try {
        setSortConfig(JSON.parse(savedSort));
      } catch (e) {
        console.error("Failed to parse saved sort config", e);
      }
    }

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error("Failed to parse saved filters", e);
      }
    }
  }, [boardName]);

  // Save to localStorage when changed
  useEffect(() => {
    if (sortConfig) {
      localStorage.setItem(`${boardName}-sort`, JSON.stringify(sortConfig));
    }
  }, [sortConfig, boardName]);

  useEffect(() => {
    if (filters.length > 0) {
      localStorage.setItem(`${boardName}-filters`, JSON.stringify(filters));
    }
  }, [filters, boardName]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (filters.length === 0) return data;

    return data.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.column];
        const filterValue = filter.value.toLowerCase();
        const itemValue = String(value || "").toLowerCase();

        switch (filter.operator) {
          case "equals":
            return itemValue === filterValue;
          case "contains":
            return itemValue.includes(filterValue);
          case "startsWith":
            return itemValue.startsWith(filterValue);
          case "endsWith":
            return itemValue.endsWith(filterValue);
          case "greaterThan":
            return parseFloat(itemValue) > parseFloat(filterValue);
          case "lessThan":
            return parseFloat(itemValue) < parseFloat(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  // Apply sort
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle numbers
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr, "he");
      } else {
        return bStr.localeCompare(aStr, "he");
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const applySort = (sort: SortConfig) => {
    setSortConfig(sort);
  };

  const applyFilters = (newFilters: FilterConfig[]) => {
    setFilters(newFilters);
  };

  const clearSort = () => {
    setSortConfig(null);
    localStorage.removeItem(`${boardName}-sort`);
  };

  const clearFilters = () => {
    setFilters([]);
    localStorage.removeItem(`${boardName}-filters`);
  };

  const toggleSort = (column: string) => {
    if (sortConfig?.column === column) {
      // Toggle direction
      setSortConfig({
        column,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // New column, default to ascending
      setSortConfig({ column, direction: "asc" });
    }
  };

  return {
    sortedData,
    sortConfig,
    filters,
    applySort,
    applyFilters,
    clearSort,
    clearFilters,
    toggleSort,
  };
}

