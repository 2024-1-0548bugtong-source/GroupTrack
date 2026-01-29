import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NOTE: We are using Firebase Firestore, but we define Zod schemas here
// for consistency and type sharing between frontend and backend (if needed).

export const projectStatus = ["active", "completed", "archived"] as const;
export const taskStatus = ["pending", "in_progress", "completed"] as const;
export const memberRole = ["leader", "researcher", "editor", "member"] as const;

// Zod Schemas for Firestore Data Models

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdBy: z.string(), // UID
  createdAt: z.string(), // ISO string or timestamp
  joinCode: z.string(),
  status: z.enum(projectStatus).default("active"),
  deadline: z.string().optional(),
});

export const memberSchema = z.object({
  uid: z.string(),
  displayName: z.string().default("Guest"),
  role: z.enum(memberRole).default("member"),
  joinedAt: z.string(),
  isActive: z.boolean().default(true),
});

export const taskSchema = z.object({
  id: z.string().optional(), // Firestore ID
  title: z.string().min(1, "Title is required"),
  details: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(taskStatus).default("pending"),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  dueAt: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Task = z.infer<typeof taskSchema>;

// Drizzle tables (Minimal placeholder to satisfy build requirements if needed)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
