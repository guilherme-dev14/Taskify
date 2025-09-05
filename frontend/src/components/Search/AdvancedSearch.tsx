import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { advancedTaskService } from "../../services/Tasks/advancedTask.service";
import type { IAdvancedTaskFilters, ITask } from "../../types/task.types";

interface AdvancedSearchProps {
  workspaceId?: string;
  onSearchResults?: (results: ITask[], filters: IAdvancedTaskFilters) => void;
  className?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: IAdvancedTaskFilters;
  createdAt: string;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-800" },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800",
  },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];

export function AdvancedSearch({
  workspaceId,
  onSearchResults,
  className = "",
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [savedSearchName, setSavedSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [filters, setFilters] = useState<IAdvancedTaskFilters>({
    page: 0,
    size: 50,
    sortBy: "updatedAt",
    sortDir: "desc",
    workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
  });

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["advanced-search", filters, searchQuery],
    queryFn: () =>
      advancedTaskService.searchTasks({
        ...filters,
        // Add text search to filters if supported by backend
        ...(searchQuery && { query: searchQuery }),
      }),
    enabled: false, // Only run when triggered
  });

  // Get popular tags
  const { data: popularTags = [] } = useQuery({
    queryKey: ["popular-tags", workspaceId],
    queryFn: () =>
      workspaceId
        ? advancedTaskService.getPopularTags(workspaceId)
        : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  // Mock saved searches (replace with actual API)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const handleSearch = () => {
    refetch().then(() => {
      if (searchResults) {
        onSearchResults?.(searchResults.content, filters);
      }
    });
  };

  const handleFilterChange = (
    key: keyof IAdvancedTaskFilters,
    value: number[] | string[] | string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      handleFilterChange("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    handleFilterChange("tags", newTags.length > 0 ? newTags : undefined);
  };

  const clearAllFilters = () => {
    setFilters({
      page: 0,
      size: 50,
      sortBy: "updatedAt",
      sortDir: "desc",
      workspaceId: workspaceId ? parseInt(workspaceId) : undefined,
    });
    setTags([]);
    setSearchQuery("");
  };

  const saveSearch = () => {
    if (!savedSearchName.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: savedSearchName.trim(),
      filters: { ...filters, tags },
      createdAt: new Date().toISOString(),
    };

    setSavedSearches((prev) => [...prev, newSavedSearch]);
    setSavedSearchName("");
    setShowSaveDialog(false);
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setTags(savedSearch.filters.tags || []);
    handleSearch();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.assigneeId) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.estimatedHoursMin || filters.estimatedHoursMax) count++;
    if (filters.progressMin || filters.progressMax) count++;
    if (tags.length > 0) count++;
    return count;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
            showFilters || getActiveFiltersCount() > 0
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Saved:
          </span>
          {savedSearches.map((savedSearch) => (
            <button
              key={savedSearch.id}
              onClick={() => loadSavedSearch(savedSearch)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 whitespace-nowrap"
            >
              <BookmarkIcon className="h-3 w-3" />
              <span className="text-xs">{savedSearch.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ""}
                onChange={(e) =>
                  handleFilterChange("priority", e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Priority</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortDir}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortDir",
                      e.target.value as "asc" | "desc"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Due Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dueDateFrom || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "dueDateFrom",
                      e.target.value || undefined
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dueDateTo || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDateTo", e.target.value || undefined)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Estimated Hours Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.estimatedHoursMin || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "estimatedHoursMin",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.estimatedHoursMax || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "estimatedHoursMax",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Progress Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.progressMin || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "progressMin",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.progressMax || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "progressMax",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => addTag(tagInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)}>
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Tags */}
              {popularTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>

              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Save search
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {searchResults && (
                <span>{searchResults.totalElements} tasks found</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Save Search</h3>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search name"
              value={savedSearchName}
              onChange={(e) => setSavedSearchName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={saveSearch}
              disabled={!savedSearchName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
