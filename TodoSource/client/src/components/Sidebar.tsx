import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface SidebarProps {
  stats?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  onFilterChange?: (status: string) => void;
}

export default function Sidebar({ stats, onFilterChange }: SidebarProps) {
  const { user } = useAuth() as { user: User | undefined };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return 'User';
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <i className="fas fa-check-circle text-primary mr-3"></i>
          TodoApp
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button className="w-full flex items-center px-4 py-3 text-left bg-primary/10 text-primary rounded-md font-medium" data-testid="nav-dashboard">
            <i className="fas fa-home mr-3"></i>
            Dashboard
          </button>
          <button 
            className="w-full flex items-center px-4 py-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all" 
            data-testid="nav-all-tasks"
            onClick={() => onFilterChange?.('all')}
          >
            <i className="fas fa-list mr-3"></i>
            All Tasks
            {stats && <span className="ml-auto">{stats.total}</span>}
          </button>
          <button 
            className="w-full flex items-center px-4 py-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all" 
            data-testid="nav-pending"
            onClick={() => onFilterChange?.('pending')}
          >
            <i className="fas fa-clock mr-3"></i>
            Pending
            {stats && <span className="ml-auto">{stats.pending}</span>}
          </button>
          <button 
            className="w-full flex items-center px-4 py-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all" 
            data-testid="nav-in-progress"
            onClick={() => onFilterChange?.('in-progress')}
          >
            <i className="fas fa-play mr-3"></i>
            In Progress
            {stats && <span className="ml-auto">{stats.inProgress}</span>}
          </button>
          <button 
            className="w-full flex items-center px-4 py-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all" 
            data-testid="nav-completed"
            onClick={() => onFilterChange?.('completed')}
          >
            <i className="fas fa-check mr-3"></i>
            Completed
            {stats && <span className="ml-auto">{stats.completed}</span>}
          </button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              <span data-testid="text-user-initials">
                {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {getDisplayName(user?.firstName || undefined, user?.lastName || undefined)}
              </p>
              <p className="text-xs text-muted-foreground">Premium User</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="p-2 text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
