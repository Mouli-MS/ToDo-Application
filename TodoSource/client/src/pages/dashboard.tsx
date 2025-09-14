import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import FilterBar from "@/components/FilterBar";
import TodoList from "@/components/TodoList";
import TodoForm from "@/components/TodoForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Todo, InsertTodo, UpdateTodo } from "@shared/schema";

interface TodosResponse {
  todos: Todo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    status: 'all',
    dueDate: '',
    search: '',
    page: 1,
    limit: 10,
  });
  
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch todos
  const { data: todosData, isLoading: todosLoading } = useQuery<TodosResponse>({
    queryKey: ['/api/todos', filters],
    enabled: isAuthenticated,
    retry: false,
  });


  // Fetch stats
  const { data: stats } = useQuery<TodoStats>({
    queryKey: ['/api/todos/stats'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (data: InsertTodo) => {
      const response = await apiRequest('POST', '/api/todos', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/todos'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/todos/stats'] });
      setShowTodoModal(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTodo }) => {
      const response = await apiRequest('PATCH', `/api/todos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/todos'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/todos/stats'] });
      setShowTodoModal(false);
      setEditingTodo(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/todos'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/todos/stats'] });
      setShowDeleteModal(false);
      setDeletingTodo(null);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleCreateTodo = () => {
    setEditingTodo(null);
    setShowTodoModal(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowTodoModal(true);
  };

  const handleDeleteTodo = (todo: Todo) => {
    setDeletingTodo(todo);
    setShowDeleteModal(true);
  };

  const handleSaveTodo = (data: InsertTodo) => {
    if (editingTodo) {
      updateTodoMutation.mutate({ id: editingTodo.id, data });
    } else {
      createTodoMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTodo) {
      deleteTodoMutation.mutate(deletingTodo.id);
    }
  };

  const handleToggleComplete = (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    updateTodoMutation.mutate({
      id: todo.id,
      data: { status: newStatus },
    });
  };

  const handleFilterChange = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar stats={stats} onFilterChange={handleFilterChange} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
              <p className="text-muted-foreground mt-1">Manage your daily tasks and stay productive</p>
            </div>
            <Button 
              onClick={handleCreateTodo}
              data-testid="button-create-task"
            >
              <i className="fas fa-plus mr-2"></i>
              New Task
            </Button>
          </div>
        </header>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <div className="flex-1 overflow-y-auto p-6">
          <TodoList
            todos={todosData?.todos || []}
            isLoading={todosLoading}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />

          {todosData?.pagination && todosData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, todosData.pagination.total)} of {todosData.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page <= 1}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md">
                  {filters.page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page >= (todosData?.pagination.totalPages || 1)}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showTodoModal} onOpenChange={setShowTodoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTodo ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TodoForm
            todo={editingTodo}
            onSave={handleSaveTodo}
            onCancel={() => setShowTodoModal(false)}
            isLoading={createTodoMutation.isPending || updateTodoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTodoMutation.isPending}
        todoTitle={deletingTodo?.title || ''}
      />
    </div>
  );
}
