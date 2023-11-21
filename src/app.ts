// Modules
import express from "express";
import config from "config";

// Routes
import router from "./routes";

// Middleware
import deserializeUser from "./middleware/deserializeUser";

// Utils
import connectToDb from "./utils/connectToDb";
import log from "./utils/logger";

// Variables
const app = express();
const port = config.get("port");

// 1. Body parser
app.use(express.json());

// 2. Check for token
app.use(deserializeUser);

// 3. Routes
app.use(router);

// 4. Listen app
app.listen(port, () => {
  log.info(`App started at http:localhost:${port}`);

  // 5. Connect to DB
  connectToDb();
});
