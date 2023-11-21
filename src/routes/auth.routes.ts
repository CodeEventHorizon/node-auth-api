// Modules
import express from "express";

// Schemas
import { createSessionSchema } from "../schema/auth.schema";

// Controllers
import {
  createSessionHandler,
  refreshAccessTokenHandler,
} from "../controller/auth.controller";

// Middlewares
import validateResource from "../middleware/validateResource";

const router = express.Router();

router.post(
  "/api/sessions",
  validateResource(createSessionSchema),
  createSessionHandler
);

router.post("/api/sessions/refresh", refreshAccessTokenHandler);

export default router;
