// Modules
import mongoose from "mongoose";
import config from "config";

// Utils
import log from "./logger";

// This function connects to a MongoDB database using the "dbUri" retrieved from the configuration.
const connectToDb = async () => {
  // Retrieve the MongoDB connection URL from the configuration.
  const dbUri = config.get<string>("dbUri");

  try {
    // Disable strict mode for query execution.
    mongoose.set("strictQuery", false);

    // Connect to the MongoDB database using the "connect" method of the "mongoose" module.
    await mongoose.connect(dbUri);

    // If the connection is successful, log a success message.
    log.info("Connected to DB");
  } catch (e) {
    log.error(e, "Failed to connect to DB");
    // If an error occurs while connecting to the database, wait for 5 seconds and then retry the connection.
    setTimeout(connectToDb, 5000);
  }
};

export default connectToDb;
