"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { GlassDropdown } from "@/components/ui/GlassDropdown";

interface TaskFiltersProps {
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: { priority?: string; sort?: string }) => void;
}

export function TaskFilters({ onSearchChange, onFilterChange }: TaskFiltersProps) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const updatePriority = (nextPriority: string) => {
    setPriority(nextPriority);
    onFilterChange?.({ priority: nextPriority, sort });
  };

  const updateSort = (nextSort: string) => {
    setSort(nextSort);
    onFilterChange?.({ priority, sort: nextSort });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); onSearchChange?.(e.target.value); }}
          className="glass-input w-full pl-10 text-sm"
        />
      </div>

      {/* Filters */}
      <GlassDropdown
        trigger={
          <GlassButton variant="ghost" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>
            Priority
          </GlassButton>
        }
        items={[
          { id: "all", label: priority === "ALL" ? "All priorities active" : "All priorities", onClick: () => updatePriority("ALL") },
          { id: "critical", label: priority === "CRITICAL" ? "Critical active" : "Critical", onClick: () => updatePriority("CRITICAL") },
          { id: "high", label: priority === "HIGH" ? "High active" : "High", onClick: () => updatePriority("HIGH") },
          { id: "medium", label: priority === "MEDIUM" ? "Medium active" : "Medium", onClick: () => updatePriority("MEDIUM") },
          { id: "low", label: priority === "LOW" ? "Low active" : "Low", onClick: () => updatePriority("LOW") },
        ]}
      />

      <GlassDropdown
        trigger={
          <GlassButton variant="ghost" size="sm" icon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
            Sort
          </GlassButton>
        }
        items={[
          { id: "newest", label: sort === "newest" ? "Newest First active" : "Newest First", onClick: () => updateSort("newest") },
          { id: "oldest", label: sort === "oldest" ? "Oldest First active" : "Oldest First", onClick: () => updateSort("oldest") },
          { id: "priority", label: sort === "priority" ? "Priority active" : "Priority", onClick: () => updateSort("priority") },
          { id: "due", label: sort === "due" ? "Due Date active" : "Due Date", onClick: () => updateSort("due") },
        ]}
      />
    </div>
  );
}

export default TaskFilters;
