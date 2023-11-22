// Modules
import { DocumentType } from "@typegoose/typegoose";
import { omit } from "lodash";

// Models
import { User, privateFields } from "../model/user.model";
import SessionModel from "../model/session.model";

// Utils
import { signJwt } from "../utils/jwt";

export async function createSession({ userId }: { userId: string }) {
  return SessionModel.create({ user: userId });
}

export async function findSessionById(id: string) {
  return SessionModel.findById(id);
}

/**
 * Signs a refresh token for a given user ID.
 *
 * @param {object} params - The parameters for signing the refresh token.
 * @param {string} params.userId - The ID of the user.
 * @returns {Promise<string>} - The signed refresh token.
 */
export async function signRefreshToken({
  userId,
}: {
  userId: string;
}): Promise<string> {
  // Create a session for the user
  const session = await createSession({ userId });

  // Sign a JWT using the session ID as the payload,
  // and "refreshTokenPrivateKey" as the private key
  const refreshToken = signJwt(
    { session: session._id }, // Payload containing the session ID
    "refreshTokenPrivateKey", // Private key to sign the token
    {
      expiresIn: "1y", // Expiration time of the token (1 year)
    }
  );

  // Return the signed refresh token
  return refreshToken;
}

/**
 * Signs an access token for a given user.
 *
 * @param {DocumentType<User>} user - The user document.
 * @returns {string} - The signed access token.
 */
export function signAccessToken(user: DocumentType<User>): string {
  // Omit private fields from the user object and convert it to JSON
  const payload = omit(user.toJSON(), privateFields);
  // Sign a JWT using the payload, "accessTokenPrivateKey" as the private key,
  // and set the expiration time to 15 minutes
  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
    expiresIn: "15m",
  });

  // Return the signed access token
  return accessToken;
}
