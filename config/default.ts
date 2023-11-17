export default {
  port: process.env.PORT,
  dbUri: process.env.DB_URI,
  logLevel: "info",
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
  },
};
