// Modules
import { Request, Response } from "express";
import { nanoid } from "nanoid";

// Schemas
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";

// Services
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../service/user.service";

// Utils
import sendEmail from "../utils/mailer";
import log from "../utils/logger";

/**
 * Creates a user and sends a verification email.
 *
 * @param {Request<{}, {}, CreateUserInput>} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response>} - A promise that resolves to void.
 */
export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
): Promise<Response> {
  // Extracts the request body
  const body = req.body;

  try {
    // Calls the 'createUser' function to create a user
    const user = await createUser(body);

    // Sends an email to the user with the verification code and user ID
    await sendEmail({
      from: "test@example.com",
      to: user.email,
      subject: "Please verify your account",
      text: `Verification code ${user.verificationCode}. Id: ${user._id}`,
    });

    // Sends a success response
    return res.send("User successfully created");
  } catch (e: any) {
    // Checks if the error code is 11000 (indicating duplicate entry)
    // unique constraint because email is unique
    if (e.code === 11000) {
      return res.status(409).send("Account already exists");
    }

    return res.status(500).send(e);
  }
}

/**
 * Verifies a user by their id and verification code.
 * @param {Request<VerifyUserInput>} req - The request object containing the id and verificationCode parameters.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A promise that resolves to void.
 */
export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
): Promise<Response> {
  // Get the id parameter from the request's params
  const id = req.params.id;
  // Get the verificationCode parameter from the request's params
  const verificationCode = req.params.verificationCode;

  // Find the user by their id using the findUserById function asynchronously
  const user = await findUserById(id);

  // Check if a user was found, if not send an error response
  if (!user) {
    return res.send("Could not verify user");
  }

  // Check if the user is already verified, if they are send an error response
  if (user.verified) {
    return res.send("User is already verified");
  }

  // Check if the verification code matches, if it does update the verified status for the user and save it
  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();

    return res.send("User successfully verified");
  }

  // If none of the above conditions match, send an error response
  return res.send("Could not verify user");
}

/**
 * Handles the forgot password request.
 *
 * @param {import("express").Request<{}, {}, ForgotPasswordInput>} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @returns {Promise<Response>} A promise that resolves when the function finishes handling the request.
 */
export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
): Promise<Response> {
  const message =
    "If a user with that email is registered you will receive a password reset email";
  // Extract the email from the request body
  const { email } = req.body;

  // Find the user with the given email
  const user = await findUserByEmail(email);

  // If user does not exist, log an error and send the message
  if (!user) {
    log.debug(`User with email ${email} does not exist`);
    return res.send(message);
  }

  // If user is not verified, send a different message
  if (!user.verified) {
    return res.send("User is not verified");
  }

  // Generate a unique password reset code
  const passwordResetCode = nanoid();

  // Assign the password reset code to the user's document in the database
  user.passwordResetCode = passwordResetCode;

  // Save the updated user document in the database
  await user.save();

  // Use a mail service to send a password reset email to the user
  await sendEmail({
    from: "test@example.com",
    to: user.email,
    subject: "Reset your password",
    text: `Password reset code: ${passwordResetCode}. Id ${user._id}`,
  });

  // Log that the password reset email has been sent
  log.debug(`Password reset email sent to ${email}`);

  return res.send(message);
}

/**
 * Resets the password for a user.
 *
 * @param {Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The updated user password as the response.
 */
export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
): Promise<Response> {
  // Destructuring the id and passwordResetCode from req.params.
  const { id, passwordResetCode } = req.params;
  // Destructuring the password from req.body.
  const { password } = req.body;

  // Calling the findUserById function asynchronously and storing the result in the user variable.
  const user = await findUserById(id);

  // Checking if the user does not exist or the user's password reset code is null or does not match with the provided password reset code.
  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send("Could not reset user password");
  }

  // Setting the user's password reset code to null.
  // We can do this without hashing because we have @pre hook in user model.
  user.passwordResetCode = null;
  // Setting the user's password to the new password.
  user.password = password;

  // Saving the changes made to the user object.
  await user.save();

  // Returning a success message "Successfully updated user password" as the response.
  return res.send("Successfully updated user password");
}

/**
 * Handler function to get the current user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - A promise that resolves when the response is sent.
 */
export async function getCurrentUserHandler(
  req: Request,
  res: Response
): Promise<Response> {
  return res.send(res.locals.user);
}
