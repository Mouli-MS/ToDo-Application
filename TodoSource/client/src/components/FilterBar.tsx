import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filters: {
    status: string;
    dueDate: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange((prev: any) => ({ ...prev, status: value, page: 1 }));
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev: any) => ({ ...prev, dueDate: e.target.value, page: 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev: any) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={filters.dueDate}
            onChange={handleDueDateChange}
            className="w-48"
            placeholder="Filter by due date"
            data-testid="input-due-date-filter"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-64"
            data-testid="input-search"
          />
          <Button variant="outline" size="icon" data-testid="button-search">
            <i className="fas fa-search"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
