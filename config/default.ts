export default {
  port: parseInt(process.env.PORT || "3000") as number,
  dbUri: process.env.DB_URI as string,
  logLevel: "info" as const,
  smtp: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    host: process.env.SMTP_HOST as string,
    port: parseInt(process.env.SMTP_PORT || "587") as number,
    secure: (process.env.SMTP_SECURE === "true") as boolean,
  },
};
