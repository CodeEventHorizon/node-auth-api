export default {
  port: process.env.PORT,
  dbUri: process.env.DB_URI,
  logLevel: "info",
  smtp: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    host: process.env.SMTP_HOST as string,
    port: 587,
    secure: false,
  },
};
