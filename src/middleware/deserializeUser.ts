// Modules
import { Request, Response, NextFunction } from "express";

// Utils
import { verifyJwt } from "../utils/jwt";

/**
 * Middleware function to deserialize the user object based on the provided access token.
 *
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the middleware is complete.
 */
const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract the access token from the Authorization header.
  const accessToken = (req.headers.authorization || "").replace(
    /^Bearer\s/,
    ""
  );

  // If no access token is provided, move to the next middleware function.
  if (!accessToken) {
    return next();
  }

  // Verify the access token using the "verifyJwt" function with the provided public key.
  const decoded = verifyJwt(accessToken, "accessTokenPublicKey");

  // If the access token is valid and successfully decoded, set the decoded user object in the response locals for further use.
  if (decoded) {
    res.locals.user = decoded;
  }

  // Move to the next middleware function.
  return next();
};

export default deserializeUser;
