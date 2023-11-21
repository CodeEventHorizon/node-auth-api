// Modules
import { NextFunction, Request, Response } from "express";

/**
 * Middleware function to ensure that a user is authenticated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The callback function for the next middleware.
 * @returns {void}
 */
const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  // Retrieve the user object from the response locals.
  const user = res.locals.user;

  // If no user object exists, return a 403 Forbidden status code.
  if (!user) {
    return res.sendStatus(403);
  }

  // Move to the next middleware function.
  return next();
};

export default requireUser;
