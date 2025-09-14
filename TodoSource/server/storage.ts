import {
  users,
  todos,
  type User,
  type UpsertUser,
  type Todo,
  type InsertTodo,
  type UpdateTodo,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Todo operations
  getTodos(userId: string, filters?: {
    status?: string;
    dueDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ todos: Todo[]; total: number }>;
  getTodo(id: string, userId: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo, userId: string): Promise<Todo>;
  updateTodo(id: string, userId: string, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: string, userId: string): Promise<boolean>;
  getTodoStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Todo operations
  async getTodos(userId: string, filters?: {
    status?: string;
    dueDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ todos: Todo[]; total: number }> {
    const conditions = [eq(todos.userId, userId)];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(todos.status, filters.status as any));
    }
    
    if (filters?.dueDate) {
      const targetDate = new Date(filters.dueDate);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      conditions.push(
        and(
          eq(todos.dueDate, targetDate),
        )!
      );
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(todos.title, `%${filters.search}%`),
          ilike(todos.description, `%${filters.search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(todos)
      .where(whereClause);

    // Get todos with pagination
    const query = db
      .select()
      .from(todos)
      .where(whereClause)
      .orderBy(desc(todos.createdAt));

    if (filters?.limit) {
      query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const todoList = await query;

    return {
      todos: todoList,
      total: Number(count),
    };
  }

  async getTodo(id: string, userId: string): Promise<Todo | undefined> {
    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
    return todo;
  }

  async createTodo(todo: InsertTodo, userId: string): Promise<Todo> {
    const [newTodo] = await db
      .insert(todos)
      .values({
        ...todo,
        userId,
      })
      .returning();
    return newTodo;
  }

  async updateTodo(id: string, userId: string, updates: UpdateTodo): Promise<Todo | undefined> {
    const [updatedTodo] = await db
      .update(todos)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return updatedTodo;
  }

  async deleteTodo(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getTodoStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }> {
    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId));

    const stats = {
      total: userTodos.length,
      pending: userTodos.filter(t => t.status === 'pending').length,
      inProgress: userTodos.filter(t => t.status === 'in-progress').length,
      completed: userTodos.filter(t => t.status === 'completed').length,
    };

    return stats;
  }
}

export const storage = new DatabaseStorage();
