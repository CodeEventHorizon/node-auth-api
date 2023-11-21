// Modules
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the request data using the provided schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If parsing is successful, call the 'next' middleware
      next();
    } catch (e: any) {
      // If an error occurs during parsing, catch the error

      // Return a response with a status code of 400 (Bad Request)
      // and send the error messages as the response body
      return res.status(400).send(e.errors);
    }
  };

export default validateResource;
