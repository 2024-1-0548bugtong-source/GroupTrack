import { z } from "zod";

// Minimal API contract since we are using Firebase Client SDK
// This file is required for the project structure.

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  health: {
    check: {
      method: "GET" as const,
      path: "/api/health",
      responses: {
        200: z.object({ status: z.literal("ok") }),
      },
    },
  },
};
