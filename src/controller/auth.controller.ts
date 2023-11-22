// Modules
import { Request, Response } from "express";
import { get } from "lodash";

// Schemas
import { CreateSessionInput } from "../schema/auth.schema";

// Services
import { findUserByEmail, findUserById } from "../service/user.service";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";

// Utils
import { verifyJwt } from "../utils/jwt";

/**
 * Creates a session for a user by validating their email and password,
 * and returning access and refresh tokens.
 *
 * @param {Request<{}, {}, CreateSessionInput>} req - The request object containing the email and password.
 * @param {Response} res - The response object to send the tokens.
 * @returns {Promise<Response>} The response object with the access and refresh tokens.
 */
export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
): Promise<Response> {
  // Error message for invalid email or password
  const message = "Invalid email or password";
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Find a user in the database by email address
  const user = await findUserByEmail(email);

  // If no user is found, return an error message
  if (!user) {
    return res.send(message);
  }

  // If user is not verified, return a message asking them to verify their email
  if (!user.verified) {
    return res.send("Please verify your email");
  }

  // Validate the user's password
  const isValid = await user.validatePassword(password);

  // If password is not valid, return an error message
  if (!isValid) {
    return res.send(message);
  }

  // Sign an access token for the user
  const accessToken = signAccessToken(user);

  // Sign a refresh token with user ID as payload
  const refreshToken = await signRefreshToken({ userId: user._id });

  // Send the access and refresh tokens in the response
  return res.send({
    accessToken,
    refreshToken,
  });
}

/**
 * Refreshes access token.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Reponse>}
 */
export async function refreshAccessTokenHandler(
  req: Request,
  res: Response
): Promise<Response> {
  // Extract the refresh token from the request headers
  const refreshToken = get(req, "headers.x-refresh") as string;

  // Verify the JWT token and decode it
  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  // If the token cannot be verified or decoded, return a 401 status code with an error message
  if (!decoded) {
    return res.status(401).send("Could not refresh access token");
  }

  // Find the session by its ID
  const session = await findSessionById(decoded.session);

  // If the session does not exist or is invalid, return a 401 status code with an error message
  if (!session || !session.valid) {
    return res.status(401).send("Could not refresh access token");
  }

  // Find the user by their ID
  const user = await findUserById(String(session.user));

  // If the user does not exist, return a 401 status code with an error message
  if (!user) {
    return res.status(401).send("Could not refresh access token");
  }

  // Sign a new access token for the user
  const accessToken = signAccessToken(user);

  // Return the new access token in the response
  return res.send({ accessToken });
}
