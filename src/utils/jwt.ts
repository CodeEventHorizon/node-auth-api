// Modules
import jwt from "jsonwebtoken";
import config from "config";

// Utils
import log from "./logger";

/**
 * Signs a JWT using the provided object, key name, and options.
 * @param object - The payload object to be encoded in the JWT.
 * @param keyName - The name of the private key to use for signing the JWT. Can be "accessTokenPrivateKey" or "refreshTokenPrivateKey".
 * @param options - Optional sign options to customize the JWT signing process.
 * @returns The signed JWT.
 */
export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  // Convert the base64-encoded private key into an ASCII string
  const signingKey = Buffer.from(
    config.get<string>(keyName),
    "base64"
  ).toString("ascii");

  // Sign the JWT using the provided object, signing key, and options
  return jwt.sign(object, signingKey, {
    // Spread the provided options if any, or leave it empty
    ...(options && options),
    // Specify the signing algorithm as RS256
    algorithm: "RS256",
  });
}

/**
 * Verifies a JWT using the provided token and public key.
 * @param token - The JWT to be verified.
 * @param keyName - The name of the public key to use for verifying the JWT. Can be "accessTokenPublicKey" or "refreshTokenPublicKey".
 * @returns The decoded payload if the JWT is valid, or null if the JWT is invalid.
 */
export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  // Convert the base64-encoded public key from the configuration file into an ASCII string
  const publicKey = Buffer.from(config.get<string>(keyName), "base64").toString(
    "ascii"
  );

  try {
    // Verify the JWT using the provided token and public key
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    log.error("Failed to verify JWT token");
    return null;
  }
}
