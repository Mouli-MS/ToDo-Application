import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTodoSchema, updateTodoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Todo routes
  app.get('/api/todos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status, dueDate, search, page = '1', limit = '10' } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        status: status as string,
        dueDate: dueDate as string,
        search: search as string,
        limit: limitNum,
        offset,
      };

      const result = await storage.getTodos(userId, filters);
      
      res.json({
        todos: result.todos,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.get('/api/todos/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getTodoStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching todo stats:", error);
      res.status(500).json({ message: "Failed to fetch todo stats" });
    }
  });

  app.get('/api/todos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const todo = await storage.getTodo(id, userId);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(todo);
    } catch (error) {
      console.error("Error fetching todo:", error);
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  app.post('/api/todos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("POST /api/todos - Request body:", JSON.stringify(req.body, null, 2));
      
      // Convert date string to Date object for validation
      const processedBody = { ...req.body };
      if (processedBody.dueDate && typeof processedBody.dueDate === 'string') {
        processedBody.dueDate = new Date(processedBody.dueDate);
      }
      
      const validationResult = insertTodoSchema.safeParse(processedBody);
      
      if (!validationResult.success) {
        console.log("Validation failed:", JSON.stringify(validationResult.error.errors, null, 2));
        return res.status(422).json({ 
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const todo = await storage.createTodo(validationResult.data, userId);
      res.status(201).json(todo);
    } catch (error) {
      console.error("Error creating todo:", error);
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  app.patch('/api/todos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Convert date string to Date object for validation
      const processedBody = { ...req.body };
      if (processedBody.dueDate && typeof processedBody.dueDate === 'string') {
        processedBody.dueDate = new Date(processedBody.dueDate);
      }
      
      const validationResult = updateTodoSchema.safeParse(processedBody);
      
      if (!validationResult.success) {
        return res.status(422).json({ 
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const todo = await storage.updateTodo(id, userId, validationResult.data);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(todo);
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  app.delete('/api/todos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteTodo(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
