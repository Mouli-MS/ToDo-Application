import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTodoSchema, type InsertTodo, type Todo } from "@shared/schema";
import { format } from "date-fns";

interface TodoFormProps {
  todo?: Todo | null;
  onSave: (data: InsertTodo) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TodoForm({ todo, onSave, onCancel, isLoading }: TodoFormProps) {
  const form = useForm<InsertTodo>({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
      status: todo?.status || 'pending',
      dueDate: todo?.dueDate ? new Date(todo.dueDate) : undefined,
    },
  });

  const onSubmit = (data: InsertTodo) => {
    onSave(data);
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="todo-form">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task title"
                  {...field}
                  data-testid="input-todo-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description (optional)"
                  rows={3}
                  {...field}
                  value={field.value || ''}
                  data-testid="textarea-todo-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-todo-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={formatDateForInput(field.value || undefined)}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                    data-testid="input-todo-due-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel-todo"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-save-todo"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              todo ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
