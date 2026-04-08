import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NOTE: We are using Firebase Firestore, but we define Zod schemas here
// for consistency and type sharing between frontend and backend (if needed).

export const projectStatus = ["active", "completed", "archived"] as const;
export const taskStatus = ["pending", "in_progress", "submitted", "completed"] as const;
export const memberRole = ["leader", "researcher", "editor", "member"] as const;
export const projectAssignmentPolicy = ["all_members", "leader_only"] as const;

export const taskFileSchema = z.object({
  fileId: z.string(),
  storagePath: z.string(),
  downloadURL: z.string().url(),
  name: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  uploadedByUid: z.string(),
  uploadedByName: z.string(),
  uploadedAt: z.string(),
  stage: z.enum(["assignment", "submission", "official"]),
});

// Zod Schemas for Firestore Data Models

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdBy: z.string(), // UID
  createdAt: z.string(), // ISO string or timestamp
  joinCode: z.string(),
  status: z.enum(projectStatus).default("active"),
  assignmentPolicy: z.enum(projectAssignmentPolicy).default("all_members"),
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
  assignedTo: z.string().optional(), // member UID
  assignedToName: z.string().optional(), // display name
  assignedToRole: z.enum(memberRole).optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  dueAt: z.string().optional(),
  submittedAt: z.string().nullable().optional(),
  submittedByUid: z.string().nullable().optional(),
  submittedByName: z.string().nullable().optional(),
  submissionDueAt: z.string().nullable().optional(),
  isLateSubmission: z.boolean().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  approvedByUid: z.string().nullable().optional(),
  approvedByName: z.string().nullable().optional(),
  approvalDecision: z.enum(["approved", "changes_requested"]).nullable().optional(),
  revisionCount: z.number().optional(),
  assignmentFiles: z.array(taskFileSchema).optional(),
  submissionFiles: z.array(taskFileSchema).optional(),
  officialSubmissionFiles: z.array(taskFileSchema).optional(),
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
