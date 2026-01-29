import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Minimal health check endpoint
  app.get(api.health.check.path, (_req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
