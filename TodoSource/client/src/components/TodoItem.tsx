import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Todo } from "@shared/schema";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
};

export default function TodoItem({ todo, onEdit, onDelete, onToggleComplete }: TodoItemProps) {
  const isCompleted = todo.status === 'completed';
  const status = statusConfig[todo.status] || statusConfig.pending;

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  return (
    <div 
      className={`bg-card rounded-lg border border-border p-6 hover:shadow-md transition-all ${isCompleted ? 'opacity-75' : ''}`}
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete(todo)}
              className="mr-3"
              data-testid={`checkbox-todo-${todo.id}`}
            />
            <h3 className={`text-lg font-semibold text-foreground ${isCompleted ? 'line-through' : ''}`} data-testid={`text-todo-title-${todo.id}`}>
              {todo.title}
            </h3>
            <Badge className={`ml-3 ${status.className}`} data-testid={`badge-todo-status-${todo.id}`}>
              {status.label}
            </Badge>
          </div>
          
          {todo.description && (
            <p className="text-muted-foreground mb-3" data-testid={`text-todo-description-${todo.id}`}>
              {todo.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            {todo.dueDate && (
              <>
                <i className="fas fa-calendar-alt mr-2"></i>
                <span data-testid={`text-todo-due-date-${todo.id}`}>
                  Due: {formatDate(todo.dueDate)}
                </span>
              </>
            )}
            {todo.createdAt && (
              <>
                <i className={`fas fa-clock ${todo.dueDate ? 'ml-4' : ''} mr-2`}></i>
                <span data-testid={`text-todo-created-at-${todo.id}`}>
                  Created: {formatDate(todo.createdAt)}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(todo)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
            data-testid={`button-edit-todo-${todo.id}`}
          >
            <i className="fas fa-edit"></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(todo)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            data-testid={`button-delete-todo-${todo.id}`}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
