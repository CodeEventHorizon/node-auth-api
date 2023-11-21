// Modules
import logger from "pino";
import dayjs from "dayjs";
import config from "config";

// config
const level = config.get<string>("logLevel");

/**
 * Creates a logger with the specified configuration options.
 * @param options - The configuration options for the logger.
 * @returns A logger instance.
 */
const log = logger({
  // Specifies the transport to use for logging, in this case "pino-pretty"
  //! pino-pretty is discouraged from using in production
  transport: {
    target: "pino-pretty",
  },
  // Specifies the log level (e.g. "debug", "info", "warn", "error")
  level,
  // Specifies additional base properties for the log entries
  base: {
    // Disables logging of process ID in each log entry
    pid: false,
  },
  // Specifies a custom timestamp for each log entry, using the dayjs library to format the current time
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
