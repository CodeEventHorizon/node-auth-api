// Modules
import express from "express";

// Routes
import user from "./user.routes";
import auth from "./auth.routes";

const router = express.Router();

// Define a route handler for a GET request to "/healthcheck"
router.get("/healthcheck", (_, res) => res.sendStatus(200));

// Mount the user route handler on the router
router.use(user);
// Mount the auth route handler on the router
router.use(auth);

export default router;
