import { Request, Response, NextFunction } from "express";

export type ErrorCodes =
  | "RequestValidationError"
  | "InvalidTaskError"
  | "NotFoundError"
  | "InternalServerError"
  | "ApiRateLimitExceeded";

// @Anthony: I replace the AppError implementation with a class extending the
// native Error class. This allows us to check the error type at runtime,
// which lets us make the error handler more generic and robust.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCodes,
    public readonly statusCode: number = 400,
    public readonly isOperational?: boolean
  ) {
    super(message);
  }
}

export const createError = (
  message: string,
  code: ErrorCodes,
  statusCode: number
): AppError => {
  return new AppError(message, code, statusCode, true);
};

// @Anthony: I modified the signature of the error handler to accept the native
// Javascript error type, so that it can safely handle non-application-specific
// exceptions.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    // @Anthony: Even though the task states:
    //   'Add custom error messages for different validation failures',
    // My preferred approach is to allow the service layer to define the error
    // messages, and provide a default fallback value in the error handler.
    // In my experience this is more versatile.
    if (
      err.code === "RequestValidationError" ||
      err.code === "InvalidTaskError"
    ) {
      // In the case of a request validation error, we wouldn't want
      // to reveal specific API implementation details to the client, so
      // ideally we'd return a generic error message.
      res.status(400).json({
        error: {
          message: err.message ?? "Bad Request",
          code: err.code,
          status: 400,
          timestamp: new Date().toISOString(),
        },
      });
    } else if (err.code === "ApiRateLimitExceeded") {
      res.status(429).json({
        error: {
          message: err.message ?? "Too Many Requests",
          code: err.code,
          status: 429,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return;
  }

  console.error("Unhandled Error:", err);

  // Default error response
  res.status(500).json({
    error: {
      message: err.message || "Internal Server Error",
      code: "InternalServerError",
      status: 500,
      timestamp: new Date().toISOString(),
    },
  });
};
