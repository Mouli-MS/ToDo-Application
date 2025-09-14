import TodoItem from "@/components/TodoItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { Todo } from "@shared/schema";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
}

export default function TodoList({ todos, isLoading, onEdit, onDelete, onToggleComplete }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Skeleton className="w-4 h-4 mr-3" />
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="ml-3 h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <div className="max-w-md mx-auto">
          <i className="fas fa-clipboard-list text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}
