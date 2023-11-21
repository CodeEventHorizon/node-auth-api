// Modules
import config from "config";
import nodemailer, { SendMailOptions } from "nodemailer";

// Utils
import log from "./logger";

// async function createTestCreds() {
//   const creds = await nodemailer.createTestAccount();
//   console.log({ creds });
// }
// createTestCreds();

// config
const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>("smtp");

// nodemailer transporter
const transporter = nodemailer.createTransport({
  ...smtp,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

// This function sends an email using the "sendMail" method of a "transporter" object.
async function sendEmail(payload: SendMailOptions) {
  // The "sendMail" method is called with the "payload" as the first argument and a callback function as the second argument.
  transporter.sendMail(payload, (err, info) => {
    // If there is an error while sending the email, log the error message and return.
    if (err) {
      log.error(err, "Error sending email");
      return;
    }

    // If the email is sent successfully, generate a preview URL using the "getTestMessageUrl" method of the "nodemailer" module.
    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
