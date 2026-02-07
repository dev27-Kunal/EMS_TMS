import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DataTableFilters = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = searchValue || Object.values(filterValues).some((v) => v);

  return (
    <div className="filter-panel">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filterValues[filter.key] || ''}
          onValueChange={(value) => onFilterChange(filter.key, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default DataTableFilters;
